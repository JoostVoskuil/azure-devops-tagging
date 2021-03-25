import * as tl from 'azure-pipelines-task-lib';
import * as azdev from 'azure-devops-node-api/WebApi';
import * as ba from 'azure-devops-node-api/BuildApi';
import * as ga from 'azure-devops-node-api/GitApi';
import * as ra from 'azure-devops-node-api/ReleaseApi';

import { IProxyConfiguration, IRequestOptions } from 'azure-devops-node-api/interfaces/common/VsoBaseInterfaces';
import { GitAnnotatedTag, GitObjectType } from 'azure-devops-node-api/interfaces/GitInterfaces';

async function run() {
   try {
      const collectionUri = tl.getEndpointUrl('SYSTEMVSSCONNECTION', true);
      const token = tl.getEndpointAuthorizationParameter('SYSTEMVSSCONNECTION', 'AccessToken', true);

      if (collectionUri === undefined || token === undefined) {
         throw Error(`System.AccessToken is not available.`);
      }

      const connection = await getAzureDevOpsConnection(collectionUri, token);
      const tagInput = getAzureDevOpsInput('tags');
      const tagType = getAzureDevOpsInput('tagtype');
      const tags = tagInput.split(',');
      const teamProject = getAzureDevOpsVariable('System.TeamProject');
      const hostType = getAzureDevOpsVariable('System.HostType').toLowerCase();

      if (hostType === 'build' && tagType === 'release') throw Error(`When running a pipeline, you can only tag pipelines and git commits.`);
      if (hostType === 'release' && tagType !== 'release') throw Error(`When running a release, you can only tag releases.`);
      if (hostType === 'deployment' && tagType !== 'release') throw Error(`When running a release, you can only tag releases.`);

      switch (tagType) {
         case 'pipeline': {
            await tagPipeline(tags, teamProject, connection);
            break;
         }
         case 'git': {
            if (tags.length > 1) tl.warning(`Multiple tags detected. Contatenating tags to one:${tags.join(',')}`);
            const message = getAzureDevOpsInput('message');
            await tagGit(tags.join(','), message, teamProject, connection);
            break;
         }
         case 'release': {
            await tagRelease(tags, teamProject, connection);
            break;
         }
         default: {
            throw Error(`Unknown tagType: ${tagType}`);
         }
      }
      tl.setResult(tl.TaskResult.Succeeded, '');
   }
   catch (err) {
      tl.setResult(tl.TaskResult.Failed, err)
   }
}

run();

async function tagPipeline(tags: string[], teamProject: string, connection: azdev.WebApi): Promise<void> {
   const buildApi: ba.BuildApi = await connection.getBuildApi();
   const buildId = Number(getAzureDevOpsVariable('Build.BuildId'));
   await buildApi.addBuildTags(tags, teamProject, buildId);
   console.log(`Added pipeline tags: '${tags.join(',')}'.`);
}

async function tagRelease(tags: string[], teamProject: string, connection: azdev.WebApi): Promise<void> {
   const releaseApi: ra.IReleaseApi = await connection.getReleaseApi();
   const releaseId = Number(getAzureDevOpsVariable('Release.ReleaseId'));
   await releaseApi.addReleaseTags(tags, teamProject, releaseId);
   console.log(`Added release tags: '${tags.join(',')}'.`);
}

async function tagGit(tag: string, message: string, teamProject: string, connection: azdev.WebApi): Promise<void> {
   const gitApi: ga.GitApi = await connection.getGitApi();
   const repositoryId = getAzureDevOpsVariable(`Build.Repository.Id`);
   const commitId = getAzureDevOpsVariable(`Build.SourceVersion`);

   const tagObject: GitAnnotatedTag = {
      message: message,
      name: tag,
      taggedObject: {
         objectId: commitId,
         objectType: GitObjectType.Commit
      }
   };

   await gitApi.createAnnotatedTag(tagObject, teamProject, repositoryId);
   console.log(`Added git tag ${tag} with message: ${message}`);
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

   if (agentProxy)
   {
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
