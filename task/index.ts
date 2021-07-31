import * as tl from 'azure-pipelines-task-lib';
import * as azdev from 'azure-devops-node-api/WebApi';
import * as ba from 'azure-devops-node-api/BuildApi';
import * as ga from 'azure-devops-node-api/GitApi';
import * as ra from 'azure-devops-node-api/ReleaseApi';

import { IProxyConfiguration, IRequestOptions } from 'azure-devops-node-api/interfaces/common/VsoBaseInterfaces';
import { GitAnnotatedTag, GitObjectType } from 'azure-devops-node-api/interfaces/GitInterfaces';
import { Release } from 'azure-devops-node-api/interfaces/ReleaseInterfaces';

async function run() {
   try {
      const collectionUri = tl.getEndpointUrl('SYSTEMVSSCONNECTION', true);
      const token = tl.getEndpointAuthorizationParameter('SYSTEMVSSCONNECTION', 'AccessToken', true);

      if (collectionUri === undefined || token === undefined) {
         throw Error(`System.AccessToken is not available.`);
      }

      const connection = await getAzureDevOpsConnection(collectionUri, token);
      const tags = getAzureDevOpsInput('tags').split(',');
      const tagType = getAzureDevOpsInput('tagtype');

      const teamProject = getAzureDevOpsVariable('System.TeamProject');
      const hostType = getAzureDevOpsVariable('System.HostType').toLowerCase();

      switch (hostType) {
         case 'build': {
            if (tagType === 'release') {
               throw 'You are running a build/pipeline. Tagging a release is not possible.'
            }
            else if (tagType === 'build') {
               const buildId = Number(getAzureDevOpsVariable('Build.BuildId'));
               const tagMainGitRepository = tl.getBoolInput('tagMainGitRepository');
               await tagPipeline(tags, teamProject, buildId, connection, tagMainGitRepository);
            }
            else if (tagType === 'git') {
               if (tags.length > 1) tl.warning(`Multiple tags detected. Concatenating tags to one:${tags.join(',')}`);
               const message = getAzureDevOpsInput('message');
               const repositoryId = getAzureDevOpsVariable(`Build.Repository.Id`);
               const commitId = getAzureDevOpsVariable(`Build.SourceVersion`);
               await tagGit(tags.join(','), message, teamProject, repositoryId, commitId, connection);
            }
            break;
         }
         case 'deployment':
         case 'release': {

            if (tagType === 'build') {
               throw 'You are running a classic release pipeline. Tagging a build/pipeline is not possible.';
            }
            else if (tagType === 'git') {
               throw 'You are running a classic release pipeline. Tagging a git commit directly is not possible.';
            }
            else if (tagType === 'release') {
               const releaseId = Number(getAzureDevOpsVariable('Release.ReleaseId'));
               await tagRelease(tags, teamProject, releaseId, connection);
               const inputTagBuildArtifacts = tl.getBoolInput('tagbuildartifacts');

               if (inputTagBuildArtifacts) {
                  const exclusionsInputString = tl.getInput('tagbuildartifactsexclusions');
                  await tagBuildArtifacts(tags, teamProject, releaseId, connection, exclusionsInputString);
               }

               const inputTagGitArtifacts = tl.getBoolInput('taggitartifacts');
               if (inputTagGitArtifacts) {
                  const message = getAzureDevOpsInput('message');
                  const exclusionsInputString = tl.getInput('taggitartifactsexclusions');
                  await tagGitArtifacts(tags, message, teamProject, releaseId, connection, exclusionsInputString);
               }
            }
            break;
         }
      }
      tl.setResult(tl.TaskResult.Succeeded, '');
   }
   catch (err) {
      tl.setResult(tl.TaskResult.Failed, err as string);
   }
}

run();

async function tagBuildArtifacts(tags: string[], teamProject: string, releaseId: number, connection: azdev.WebApi, exclusionsInputString?: string): Promise<void> {
   const releaseApi: ra.IReleaseApi = await connection.getReleaseApi();
   const release: Release = await releaseApi.getRelease(teamProject, releaseId);

   console.log(`Tagging build artifacts:`);
   if (!release.artifacts) 
   { 
      console.log(`- No build artifacts found`);
      return;
   }

   for (const artifact of release.artifacts.filter(x => x.type === 'Build')) {
      if (artifact.alias === undefined) continue;
      if (regExpFromString(artifact.alias, exclusionsInputString)) {
         console.log(`- '${artifact.alias}' matches '${exclusionsInputString}', skipping tagging for this artifact`);
         continue;
      }
      const buildId = Number(tl.getVariable(`Release.Artifacts.${artifact.alias}.BuildId`));
      const tagMainGitRepository = tl.getBoolInput('tagMainGitRepository');
      await tagPipeline(tags, teamProject, buildId, connection, tagMainGitRepository);
   }
}

async function tagGitArtifacts(tags: string[], message: string, teamProject: string, releaseId: number, connection: azdev.WebApi, exclusionsInputString?: string): Promise<void> {
   const releaseApi: ra.IReleaseApi = await connection.getReleaseApi();
   const release: Release = await releaseApi.getRelease(teamProject, releaseId);
   console.log(`Tagging Git artifacts:`);
   if (!release.artifacts) {
      console.log(`- No Git artifacts found`);
      return;
   }

   for (const artifact of release.artifacts.filter(x => x.type === 'Git')) {
      if (artifact.alias === undefined) continue;
      if (regExpFromString(artifact.alias, exclusionsInputString)) {
         console.log(`- '${artifact.alias}' matches '${exclusionsInputString}', skipping tagging for this artifact`);
         continue;
      }

      const repositoryId = getAzureDevOpsVariable(`Release.Artifacts.${artifact.alias}.Repository.Id`);
      const commitId = getAzureDevOpsVariable(`Release.Artifacts.${artifact.alias}.SourceVersion`);
      await tagGit(tags.join(','), message, teamProject, repositoryId, commitId, connection);
   }
}

async function tagPipeline(tags: string[], teamProject: string, buildId: number, connection: azdev.WebApi, tagGitRepos: boolean): Promise<void> {
   const buildApi: ba.BuildApi = await connection.getBuildApi();
   await buildApi.addBuildTags(tags, teamProject, buildId);
   console.log(`- Added pipeline tags to pipeline ${buildId}: '${tags.join(',')}'.`);

   if (tagGitRepos) {
      const build = await buildApi.getBuild(teamProject, buildId);
      if (build.repository && build.repository.id && build.sourceVersion) {
         const message = getAzureDevOpsInput('message');
         await tagGit(tags.join(','), message, teamProject, build.repository.id, build.sourceVersion, connection);
      }
   }
}

async function tagRelease(tags: string[], teamProject: string, releaseId: number, connection: azdev.WebApi): Promise<void> {
   const releaseApi: ra.IReleaseApi = await connection.getReleaseApi();
   await releaseApi.addReleaseTags(tags, teamProject, releaseId);
   console.log(`- Added release tags: '${tags.join(',')}'.`);
}

async function tagGit(tag: string, message: string, teamProject: string, repositoryId: string, commitId: string, connection: azdev.WebApi): Promise<void> {
   const gitApi: ga.GitApi = await connection.getGitApi();

   const annotatedTag: GitAnnotatedTag = {
      message: message,
      name: tag,
      taggedObject: {
         objectId: commitId,
         objectType: GitObjectType.Commit
      }
   };

   try { 
      const result = await gitApi.createAnnotatedTag(annotatedTag, teamProject, repositoryId);
      console.log(result);
      console.log(`- Added git tag ${tag} with message: ${message} to repository ${repositoryId} and commit ${commitId}`);      
   }
   catch (e) {

   }
}

function getAzureDevOpsVariable(name: string): string {
   const value = tl.getVariable(name) || undefined;
   if (value === undefined) throw Error(`Variable ${name} is empty`);
   return value;
}

function getAzureDevOpsInput(name: string): string {
   const value = tl.getInput(name) || undefined;
   if (value === undefined) throw Error(`Input ${name} is empty`);
   return value;
}

async function getAzureDevOpsConnection(collectionUri: string, token: string): Promise<azdev.WebApi> {
   const accessTokenHandler = azdev.getPersonalAccessTokenHandler(token);
   const requestOptions: IRequestOptions = {
      socketTimeout: 10000,
      allowRetries: true,
      maxRetries: 3,
   };

   const agentProxy = tl.getHttpProxyConfiguration();
   let proxyConfiguration: IProxyConfiguration;

   if (agentProxy) {
      proxyConfiguration = {
         proxyUrl: agentProxy.proxyUrl,
         proxyUsername: agentProxy.proxyUsername,
         proxyPassword: agentProxy.proxyPassword,
         proxyBypassHosts: agentProxy.proxyBypassHosts
      }
      requestOptions.proxy = proxyConfiguration;
   }

   const connection = new azdev.WebApi(collectionUri, accessTokenHandler, requestOptions)
   if (!connection) throw Error(`Connection cannot be made to Azure DevOps.`);
   return connection;
}

function regExpFromString(searchString: string, exclusionsInputString?: string) {
   if (exclusionsInputString === undefined) return false;
   let flags = exclusionsInputString.replace(/.*\/([gimuy]*)$/, '$1');
   if (flags === exclusionsInputString) flags = '';
   const pattern = (flags ? exclusionsInputString.replace(new RegExp('^/(.*?)/' + flags + '$'), '$1') : exclusionsInputString);
   try {
      const regExp = new RegExp(pattern, flags);
      return regExp.test(searchString);
   }
   catch (e) {
      return e;
   }
}