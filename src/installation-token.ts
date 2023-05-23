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
 * https://github.com/tibdex/github-app-token/blob/main/src/fetch-installation-token.ts
 */
import {info, setOutput, setSecret} from '@actions/core'
import {getOctokit} from '@actions/github'
import {createAppAuth} from '@octokit/auth-app'
import {request} from '@octokit/request'

export const setInstallationToken = async ({
  appId,
  githubApiUrl,
  installationId,
  owner,
  permissions,
  privateKey,
  repo,
  repositories
}: Readonly<{
  appId: string
  githubApiUrl: URL
  installationId?: number
  owner: string
  permissions?: Record<string, string>
  privateKey: string
  repo: string
  repositories?: string[]
}>): Promise<void> => {
  const app = createAppAuth({
    appId,
    privateKey,
    request: request.defaults({
      baseUrl: githubApiUrl.toString().replace(/\/$/, '')
    })
  })

  const authApp = await app({type: 'app'})
  const octokit = getOctokit(authApp.token)
  let repos: string[] = []
  let token: string

  if (installationId === undefined) {
    try {
      ;({
        data: {id: installationId}
      } = await octokit.rest.apps.getRepoInstallation({owner, repo}))
    } catch (error: unknown) {
      throw new Error(
        `Could not get the installation information for appId ${appId}. Is the app installed on repository ${repo}?`
      )
    }
  }

  try {
    if (permissions && repositories) {
      repos = repositories.map(item => {
        item = item.includes('/') ? item : item.split('/')[1]
        return item
      })
      if (repositories.length === 0) {
        info(
          `Create token with the ${JSON.stringify(
            permissions
          )} permissions and without access to any repositories!`
        )
      } else {
        info(
          `Create token with the ${JSON.stringify(
            permissions
          )} permissions to the repositories ${JSON.stringify(repos)}!`
        )
      }

      const {data: installation} =
        await octokit.rest.apps.createInstallationAccessToken({
          installation_id: installationId,
          permissions,
          repos
        })
      token = installation.token
    } else if (repositories) {
      repos = repositories.map(item => {
        item = item.includes('/') ? item : item.split('/')[1]
        return item
      })
      if (repositories.length === 0) {
        info(
          `Create token with the same permissions as installation ${installationId} and without access to any repositories!`
        )
      } else {
        info(
          `Create token with the same permissions as installation ${installationId} for the repositories ${JSON.stringify(
            repos
          )}!`
        )
      }

      const {data: installation} =
        await octokit.rest.apps.createInstallationAccessToken({
          installation_id: installationId,
          repos
        })
      token = installation.token
    } else if (permissions) {
      info(
        `Create token with the ${JSON.stringify(
          permissions
        )} permissions for all the repositories that installation ${installationId} has access to!`
      )
      const {data: installation} =
        await octokit.rest.apps.createInstallationAccessToken({
          installation_id: installationId,
          permissions
        })
      token = installation.token
    } else {
      info(
        `Create token with all the permissions that installation ${installationId} has!`
      )
      const {data: installation} =
        await octokit.rest.apps.createInstallationAccessToken({
          installation_id: installationId
        })
      token = installation.token
    }

    setSecret(token)
    setOutput('token', token)
    info('Token generated successfully!')
  } catch (error: unknown) {
    throw new Error('Could not create installation access token.')
  }
}
