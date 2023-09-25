import * as core from '@actions/core'
import * as github from '@actions/github';

async function run() {
  try {
    const token = core.getInput('token');
    const repoOwner = github.context.repo.owner;
    const repo = github.context.repo.repo;
    const octokit = github.getOctokit(token)
    const { data: pullRequest } = await octokit.rest.pulls.list({
      owner: repoOwner,
      repo: repo,
      state: 'open',
      sort: 'long-running',
    })
    core.setOutput('open-pr-list', pullRequest);
  } catch (error) {
    core.setFailed(error.message);
  }
}
run();
