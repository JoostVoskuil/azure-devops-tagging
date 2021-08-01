# Tagging

Tags your pipeline (build), release or git commit.

## YAML Snippet

```yaml
- task: Tagging@1
  inputs:
    tags: 'tag1,tag2'
    tagtype: 'pipeline'
```

## Why this task

This task allows you to cascade back from a release back to the git repository. This is handy when you want to tag only build & git commits when a release is done.

## Permissions for Releases

When you get the following error message running a release pipeline:

'Error: VS402904: Access denied: User <UserId> does not have manage releases permission. Contact your release manager.'

Please set the 'Manage Releases' permission for this (or all release pipelines) for user '<teamproject> Build Service (foxholenl)'  to 'allow'

## Arguments

| Name | Description|
| ----- | ----- |
| tags | Tags to be added. Use a ',' to seperate multiple tags |
| tagtype| Can be 'Pipeline' for builds/multistage pipelines, 'Release' for releases and 'git' for add Git Annotated Tags |
| message | Message to be added for Git Annotated Tags. Is not used for pipelines and releases. |
| tagbuildartifacts | Only for releases. When true it also tags the used Build Artifacts. |
| tagBuildGitRepository | When true, it tags the commit of the build pipeline with an annotated tag. |
| taggitartifacts | Only for releases. When true it also tags the used Git Artifacts |
| tagbuildartifactsexclusions | Exclude Build artifacts that matches the given RegEx |
| taggitartifactsexclusions | Exclude Git artifacts that matches the given RegEx |

Notes:

- You can use #currentdate# in the tag or git commit message. This is replace with the current date
- Only the first tag is passed as the Git Annotated Tag
- For Git tagging, the tag must be unique. If the tag already exists you will receive a warning
