import * as mr from 'azure-pipelines-task-lib/mock-run';
import path = require('path');

const taskPath = path.join(__dirname, '..', 'index.js');
let tmr: mr.TaskMockRunner = new mr.TaskMockRunner(taskPath);

// Inputs
tmr.setInput('tags', 'tag1');
tmr.run();