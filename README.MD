# Tagging

Tags your pipeline (build), release or git commit.

## YAML Snippet
```yaml
- task: Tagging@1
  inputs:
    tags: 'tag1,tag2'
    tagtype: 'pipeline'
   env:
      SYSTEM_ACCESSTOKEN: $(System.AccessToken)
```

## System AccessToken

This task requires to provide the System Access Token. See [Microsoft's System.AccessToken explaination](https://docs.microsoft.com/en-us/azure/devops/pipelines/build/variables?view=azure-devops&tabs=classic#systemaccesstoken) for more information.

## Arguments

| Name | Description |
|-|-|
| tags |  Tags to be added. Use a ',' to seperate multiple tags |
| tagtype | Can be 'Pipeline' for builds/multistage pipelines, 'Release' for releases and 'git' for add Git Annotated Tags |
| message | Message to be added for Git Annotated Tags. Is not used for pipelines and releases. |
| tagbuildartifacts |  Only for releases. When true it also tags the used Build Artifacts. |
| taggitartifacts |  Only for releases. When true it also tags the used Git Artifacts |

Please note that for git tagging, the tag must be unique.
