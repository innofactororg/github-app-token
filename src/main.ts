/**
 * The MIT License (MIT)
 * Copyright (c) 2023 Thibault Derousseaux <tibdex@gmail.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 * https://github.com/tibdex/github-app-token/blob/main/src/index.ts
 */
import {Buffer} from 'node:buffer'

import {getInput, setFailed} from '@actions/core'
import ensureError from 'ensure-error'
import isBase64 from 'is-base64'

import {setInstallationToken} from './installation-token'

async function run(): Promise<void> {
  try {
    const appId = getInput('app_id', {required: true})

    const installationIdInput = getInput('installation_id')
    const installationId = installationIdInput
      ? Number(installationIdInput)
      : undefined

    const permissionsInput = getInput('permissions')
    const permissions = permissionsInput
      ? (JSON.parse(permissionsInput) as Record<string, string>)
      : undefined

    const privateKeyInput = getInput('private_key', {required: true})
    const privateKey = isBase64(privateKeyInput)
      ? Buffer.from(privateKeyInput, 'base64').toString('utf8')
      : privateKeyInput

    const repositoryInput = getInput('repository', {required: true})
    const [owner, repo] = repositoryInput.split('/')

    const githubApiUrlInput = getInput('github_api_url', {required: true})
    const githubApiUrl = new URL(githubApiUrlInput)

    const repositoriesInput = getInput('repositories')
    const repositories = repositoriesInput
      ? (JSON.parse(repositoriesInput) as string[])
      : undefined

    await setInstallationToken({
      appId,
      githubApiUrl,
      installationId,
      owner,
      permissions,
      privateKey,
      repo,
      repositories
    })
  } catch (_error: unknown) {
    const error = ensureError(_error)
    setFailed(error)
  }
}
void run()
