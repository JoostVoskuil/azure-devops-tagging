import * as mr from 'azure-pipelines-task-lib/mock-run';
import path = require('path');
import { BuildWithAddBuildTagsMock as AddMocks } from './mockHelper';

const taskPath = path.join(__dirname, '..', 'index.js');
let tmr: mr.TaskMockRunner = new mr.TaskMockRunner(taskPath);

// Inputs
const tags: string[] = ['tag1'];
const teamProject = 'TestTeamProject';
const repositoryId = "abc"
const message = "blabla";

tmr.setInput('tags', tags.join(','));
tmr.setInput('tagType', 'git');
tmr.setInput('message', message);

// Environment Settings
process.env['SYSTEM_TEAMPROJECT'] = teamProject
process.env['SYSTEM_HOSTTYPE'] = 'build'
process.env['BUILD_REPOSITORY_ID'] = repositoryId;
process.env['BUILD_SOURCEVERSION'] = "28";

// System_AccessToken
process.env['ENDPOINT_AUTH_SCHEME_SYSTEMVSSCONNECTION'] = 'OAuth'
process.env['ENDPOINT_AUTH_PARAMETER_SYSTEMVSSCONNECTION_ACCESSTOKEN'] = 'Accesstoken'
process.env['ENDPOINT_URL_SYSTEMVSSCONNECTION'] = 'https://dev.azure.com/organisation'

tmr = AddMocks(tmr, tags, teamProject, repositoryId, message);

tmr.run();
