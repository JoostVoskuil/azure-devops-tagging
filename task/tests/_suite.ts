import * as path from 'path';
import * as assert from 'assert';
import * as ttm from 'azure-pipelines-task-lib/mock-test';


describe('Access Tokens tests', function () {
    it('Should fail when System.EnableAccessToken is not provided', function(done: Mocha.Done) {    
        const tp = path.join(__dirname, 'AccessToken_EnableAccessTokenNotProvided');
        const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);
        tr.run();
        assert.strictEqual(tr.failed, true, 'should have failed');
        assert.strictEqual(tr.stdout.indexOf('System.AccessToken is not available.') >= 0, true, 'Should contain: System.AccessToken is not available.');
        done();
    });
});

describe('Tag Pipelines', function () {
    it('Should tag pipeline with one tag', function(done: Mocha.Done) {    
        const tp = path.join(__dirname, 'Pipeline_OneTag');
        const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);
        tr.run();
        assert.strictEqual(tr.succeeded, true, 'should have succeded');
        assert.strictEqual(tr.stdout.indexOf("Added pipeline tags: 'tag1'.") >= 0, true, "Should contain: Added pipeline tags: 'tag1'.");
        done();
    });
    
    it('Should tag pipeline with more then one tag', function(done: Mocha.Done) {    
        const tp = path.join(__dirname, 'Pipeline_TwoTags');
        const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);
        tr.run();
        assert.strictEqual(tr.succeeded, true, 'should have succeded');
        assert.strictEqual(tr.stdout.indexOf("Added pipeline tags: 'tag1,tag2'.") >= 0, true, "Should contain: Added pipeline tags: 'tag1,tag2'.");
        done();
    });
});

describe('Tag Releases', function () {
    it('Should tag release with one tag', function(done: Mocha.Done) {    
        const tp = path.join(__dirname, 'Release_OneTag');
        const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);
        tr.run();
        assert.strictEqual(tr.succeeded, true, 'should have succeded');
        assert.strictEqual(tr.stdout.indexOf("Added release tags: 'tag1'.") >= 0, true, "Should contain: Added release tags: 'tag1'.");
        done();
    });
    
    it('Should tag release with more then one tag', function(done: Mocha.Done) {    
        const tp = path.join(__dirname, 'Release_TwoTags');
        const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);
        tr.run();
        assert.strictEqual(tr.succeeded, true, 'should have succeded');
        assert.strictEqual(tr.stdout.indexOf("Added release tags: 'tag1,tag2'.") >= 0, true, "Should contain: Added release tags: 'tag1,tag2'.");
        done();
    });
});

describe('Tag git', function () {
    it('Should tag git with message', function(done: Mocha.Done) {    
        const tp = path.join(__dirname, 'Git_TagMessage');
        const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);
        tr.run();
        assert.strictEqual(tr.succeeded, true, 'should have succeded');
        assert.strictEqual(tr.stdout.indexOf("Added git tag tag1 with message: blabla") >= 0, true, "Should contain: Added git tag tag1 with message: blabla.");
        done();
    });
    
    it('Should tag git but print warning when multiple tags are provided', function(done: Mocha.Done) {    
        const tp = path.join(__dirname, 'Git_TagMessageWithWarning');
        const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);
        tr.run();
        assert.strictEqual(tr.succeeded, true, 'should have succeded');
        assert.strictEqual(tr.warningIssues.length, 1, "should have one warnings");
        assert.strictEqual(tr.stdout.indexOf("Multiple tags detected") >= 0, true, "Should contain: Multiple tags detected.");
        assert.strictEqual(tr.stdout.indexOf("Added git tag tag1,tag2 with message: blabla") >= 0, true, "Should contain: Added git tag tag1,tag2 with message: blabla");
        done();
    });
});

describe('Input tests', function () {
    it('Should fail when hosttype is build and tagtype is release', function(done: Mocha.Done) {    
        const tp = path.join(__dirname, 'Input_PipelineWrongTagType');
        const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);
        tr.run();
        assert.strictEqual(tr.failed, true, 'should have failed');
        assert.strictEqual(tr.stdout.indexOf("When running a pipeline, you can only tag pipelines and git commits.") >= 0, true, "Should contain: When running a pipeline, you can only tag pipelines and git commits.");
        done();
    });
    it('Should fail when hosttype is release and tagtype is not release', function(done: Mocha.Done) {    
        const tp = path.join(__dirname, 'Input_ReleaseWrongTagType');
        const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);
        tr.run();
        assert.strictEqual(tr.failed, true, 'should have failed');
        assert.strictEqual(tr.stdout.indexOf("When running a release, you can only tag releases.") >= 0, true, "Should contain: When running a release, you can only tag releases.");
        done();
    });
    it('Should fail when hosttype is deployment and tagtype is not release', function(done: Mocha.Done) {    
        const tp = path.join(__dirname, 'Input_DeploymentWrongTagType.');
        const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);
        tr.run();
        assert.strictEqual(tr.failed, true, 'should have failed');
        assert.strictEqual(tr.stdout.indexOf("When running a release, you can only tag releases.") >= 0, true, "Should contain: When running a release, you can only tag releases.");
        done();
    });
});