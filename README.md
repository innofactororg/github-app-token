# GitHub Token

This action can be used to impersonate a GitHub App when
`secrets.GITHUB_TOKEN`'s limitations are too restrictive and a personal
access token is not suitable.

## Example Workflow

```yaml
jobs:
  job:
    runs-on: ubuntu-latest
    steps:
    - name: Generate token
      id: generate_token
      uses: innofactororg/github-action-get-app-token@v1
      with:
        app_id: ${{ secrets.APP_ID }}
        private_key: ${{ secrets.PRIVATE_KEY }}

        # Optional.
        # github_api_url: https://api.example.com

        # Optional.
        # installation_id: 1337

        # Optional.
        # Using a YAML multiline string to avoid escaping the JSON quotes.
        # permissions: >-
        #   {"members": "read"}

        # Optional.
        # repository: owner/repo

        # Optional.
        # Using a YAML multiline string to avoid escaping the JSON quotes.
        # repositories: >-
        #   ["repo1","repo2"]

      - name: Use token
        env:
          TOKEN: ${{ steps.generate_token.outputs.token }}
        run: |
          echo "The generated token is masked: ${TOKEN}"
```
