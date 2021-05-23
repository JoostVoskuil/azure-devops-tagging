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


describe('Input tests', function () {
    it('Should fail when hosttype is build and tagtype is release', function(done: Mocha.Done) {    
        const tp = path.join(__dirname, 'Input_PipelineWrongTagType');
        const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);
        tr.run();
        assert.strictEqual(tr.failed, true, 'should have failed');
        assert.strictEqual(tr.stdout.indexOf("You are running a build/pipeline. Tagging a release is not possible.") >= 0, true, "You are running a build/pipeline. Tagging a release is not possible.");
        done();
    });
    it('Should fail when hosttype is release and tagtype is build', function(done: Mocha.Done) {    
        const tp = path.join(__dirname, 'Input_ReleaseWrongTagTypeBuild');
        const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);
        tr.run();
        assert.strictEqual(tr.failed, true, 'should have failed');
        assert.strictEqual(tr.stdout.indexOf("You are running a classic release pipeline. Tagging a build/pipeline is not possible.") >= 0, true, "You are running a classic release pipeline. Tagging a build/pipeline is not possible.");
        done();
    });
    it('Should fail when hosttype is release and tagtype is git', function(done: Mocha.Done) {    
        const tp = path.join(__dirname, 'Input_ReleaseWrongTagTypeGit');
        const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);
        tr.run();
        assert.strictEqual(tr.failed, true, 'should have failed');
        assert.strictEqual(tr.stdout.indexOf("You are running a classic release pipeline. Tagging a git commit directly is not possible.") >= 0, true, "You are running a classic release pipeline. Tagging a git commit directly is not possible.");
        done();
    });
});

describe('Tag Pipelines', function () {
    it('Should tag pipeline with one tag', function(done: Mocha.Done) {    
        const tp = path.join(__dirname, 'Pipeline_OneTag');
        const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);
        tr.run();
        assert.strictEqual(tr.succeeded, true, 'should have succeded');
        assert.strictEqual(tr.stdout.indexOf("Added pipeline tags") >= 0, true, "Should contain: Added pipeline tags: 'tag1'.");
        done();
    });
    
    it('Should tag pipeline with more then one tag', function(done: Mocha.Done) {    
        const tp = path.join(__dirname, 'Pipeline_TwoTags');
        const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);
        tr.run();
        assert.strictEqual(tr.succeeded, true, 'should have succeded');
        assert.strictEqual(tr.stdout.indexOf("Added pipeline tags") >= 0, true, "Should contain: Added pipeline tags: 'tag1,tag2'.");
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

    it('Should tag deployment with one tag', function(done: Mocha.Done) {    
        const tp = path.join(__dirname, 'Deployment_OneTag');
        const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);
        tr.run();
        assert.strictEqual(tr.succeeded, true, 'should have succeded');
        assert.strictEqual(tr.stdout.indexOf("Added release tags: 'tag1'.") >= 0, true, "Should contain: Added release tags: 'tag1'.");        
        done();
    });
    it('Should tag with no artifacts', function(done: Mocha.Done) {    
        const tp = path.join(__dirname, 'Release_ArtifactEmpty');
        const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);
        tr.run();
        assert.strictEqual(tr.succeeded, true, 'should have succeded');
        assert.strictEqual(tr.stdout.indexOf("Added release tags: 'tag1'.") >= 0, true, "Should contain: Added release tags: 'tag1'.");        
        done();
    });
    it('Should tag git artifacts', function(done: Mocha.Done) {    
        const tp = path.join(__dirname, 'Release_ArtifactGit');
        const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);
        tr.run();
        assert.strictEqual(tr.succeeded, true, 'should have succeded');
        assert.strictEqual(tr.stdout.indexOf("Added release tags: 'tag1'.") >= 0, true, "Should contain: Added release tags: 'tag1'.");        
        assert.strictEqual(tr.stdout.indexOf("Added git tag") >= 0, true, "Added git tag.");        
        done();
    });
    it('Should tag build artifacts', function(done: Mocha.Done) {    
        const tp = path.join(__dirname, 'Release_ArtifactBuild');
        const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);
        tr.run();
        assert.strictEqual(tr.succeeded, true, 'should have succeded');
        assert.strictEqual(tr.stdout.indexOf("Added release tags: 'tag1'.") >= 0, true, "Should contain: Added release tags: 'tag1'.");        
        assert.strictEqual(tr.stdout.indexOf("Added pipeline tag") >= 0, true, "Added build tag.");        
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
