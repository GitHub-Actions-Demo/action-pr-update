import * as core from '@actions/core'
import * as github from '@actions/github';

async function run() {
  try {
    const token = core.getInput('token');
    const label = core.getInput('label');
    const repoOwner = github.context.repo.owner;
    const repo = github.context.repo.repo;
    const octokit = github.getOctokit(token)
    const { data: pullRequest } = await octokit.rest.pulls.list({
      owner: repoOwner,
      repo: repo,
      state: 'open',
      sort: 'long-running',
    })
    const promises = pullRequest.map(async (pr) => {
      return octokit.rest.issues.addLabels({
        owner: repoOwner,
        repo: repo,
        issue_number: pr.number,
        labels: [label]
      });
    })
    await Promise.all(promises);
  } catch (error) {
    core.setFailed(error.message);
  }
}
run();
