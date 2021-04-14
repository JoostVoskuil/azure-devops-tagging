import * as mr from 'azure-pipelines-task-lib/mock-run';
import path = require('path');
import { BuildWithAddBuildTagsMock } from './mockHelper';

const taskPath = path.join(__dirname, '..', 'index.js');
let tmr: mr.TaskMockRunner = new mr.TaskMockRunner(taskPath);

// Inputs
const tags: string[] = ['tag1'];
const teamProject = 'TestTeamProject';
const releaseId = 123
const message = "blabla";

tmr.setInput('tags', tags.join(','));
tmr.setInput('tagType', 'release');
tmr.setInput('message', message);
tmr.setInput('taggitartifacts', 'true');
tmr.setInput('tagbuildartifacts', 'false');

// Environment Settings
process.env['SYSTEM_TEAMPROJECT'] = teamProject;
process.env['SYSTEM_HOSTTYPE'] = 'release';
process.env['RELEASE_RELEASEID'] = releaseId.toString();
process.env['RELEASE_ARTIFACTS_GIT_SOURCEVERSION'] = '123';
process.env['RELEASE_ARTIFACTS_GIT_REPOSITORY_ID'] = '123';

// System_AccessToken
process.env['ENDPOINT_AUTH_SCHEME_SYSTEMVSSCONNECTION'] = 'OAuth';
process.env['ENDPOINT_AUTH_PARAMETER_SYSTEMVSSCONNECTION_ACCESSTOKEN'] = 'Accesstoken';
process.env['ENDPOINT_URL_SYSTEMVSSCONNECTION'] = 'https://dev.azure.com/organisation';

tmr = BuildWithAddBuildTagsMock(tmr, tags, teamProject, releaseId, message, true);

tmr.run();
