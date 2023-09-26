import * as core from '@actions/core'
import * as github from '@actions/github';

async function run() {
  try {
    const token = core.getInput('token');
    const labelAdd = core.getInput('label-add');
    const labelRemove = core.getInput('label-remove');
    const repoOwner = github.context.repo.owner;
    const repo = github.context.repo.repo;
    const octokit = github.getOctokit(token);
    // Get a list of all open PRs
    const { data: pullRequest } = await octokit.rest.pulls.list({
      owner: repoOwner,
      repo: repo,
      state: 'open',
      sort: 'long-running',
    })
    // Add the `label` to each PR
    const addPromises = pullRequest.map(async (pr) => {
      return octokit.rest.issues.addLabels({
        owner: repoOwner,
        repo: repo,
        issue_number: pr.number,
        labels: [labelAdd]
      });
    })
    const removePromises = pullRequest.map(async (pr) => {
      return octokit.rest.issues.removeLabel({
        owner: repoOwner,
        repo: repo,
        issue_number: pr.number,
        labels: [labelRemove]
      });
    })
    await Promise.all([...addPromises, ...removePromises]);
  } catch (error) {
    core.setFailed(error.message);
  }
}
run();
