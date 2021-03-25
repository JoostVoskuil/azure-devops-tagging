import * as mr from 'azure-pipelines-task-lib/mock-run';
import path = require('path');
import { BuildWithAddBuildTagsMock } from './mockHelper';

const taskPath = path.join(__dirname, '..', 'index.js');
let tmr: mr.TaskMockRunner = new mr.TaskMockRunner(taskPath);

// Inputs
const tags: string[] = ['tag1', 'tag2'];
const teamProject = 'TestTeamProject';
const releaseId = 123
tmr.setInput('tags', tags.join(','));
tmr.setInput('tagType', 'release');

// Environment Settings
process.env['SYSTEM_TEAMPROJECT'] = teamProject
process.env['SYSTEM_HOSTTYPE'] = 'release'
process.env['RELEASE_RELEASEID'] = releaseId.toString();

// System_AccessToken
process.env['ENDPOINT_AUTH_SCHEME_SYSTEMVSSCONNECTION'] = 'OAuth'
process.env['ENDPOINT_AUTH_PARAMETER_SYSTEMVSSCONNECTION_ACCESSTOKEN'] = 'Accesstoken'
process.env['ENDPOINT_URL_SYSTEMVSSCONNECTION'] = 'https://dev.azure.com/organisation'

tmr = BuildWithAddBuildTagsMock(tmr, tags, teamProject, releaseId);

tmr.run();
