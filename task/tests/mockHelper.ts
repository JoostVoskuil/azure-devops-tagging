import { GitAnnotatedTag } from 'azure-devops-node-api/interfaces/GitInterfaces';
import * as mr from 'azure-pipelines-task-lib/mock-run';
import path = require('path');

export function BuildWithAddBuildTagsMock(taskMockRunner: mr.TaskMockRunner, tags: string[], teamProject: string, Id, message?): mr.TaskMockRunner {
	// Mock WebApi
	taskMockRunner.registerMock('azure-devops-node-api/WebApi', {
		getPersonalAccessTokenHandler: async function (token) {
			return;
		},
		getBuildApi: async function () {
			return;
		},
		WebApi: function () {
			return {
				getBuildApi: async function () {
					return {
						addBuildTags: async function (passedTags, passedTeamProject, passedId) {
							if (teamProject !== passedTeamProject) throw `teamProject is not correctly passed: ${passedTeamProject}`
							if (passedId !== Id) throw `Id is not correctly passed: ${passedId}`
							if (JSON.stringify(passedTags) !== JSON.stringify(tags)) throw `tags are not correctly passed: ${passedTags} / ${tags}`
							return;
						},	
					}
				},
				getReleaseApi: async function () {
					return {
						addReleaseTags: async function (passedTags, passedTeamProject, passedId) {
							if (teamProject !== passedTeamProject) throw `teamProject is not correctly passed: ${passedTeamProject}`
							if (passedId !== Id) throw `Id is not correctly passed: ${passedId}`
							if (JSON.stringify(passedTags) !== JSON.stringify(tags)) throw `tags are not correctly passed: ${passedTags} / ${tags}`
							return;
						},	
					}
				},
				getGitApi: async function () {
					return {
						createAnnotatedTag(tagObject: GitAnnotatedTag, passedTeamProject, repositoryId) {
							if (teamProject !== passedTeamProject) throw `teamProject is not correctly passed: ${passedTeamProject}`
							if (tagObject.name !== tags.join(',')) throw `tags are not correctly passed: ${tagObject.name } / ${tags}`
							if (tagObject.message !== message) throw `massage is not correctly passed: ${tagObject.message } / ${message}`
							if (Id !== repositoryId) throw `repositoryId is not correctly passed: ${Id } / ${repositoryId}`
							return;
						},	
					}
				},
			}
		}

	});
return taskMockRunner;
}