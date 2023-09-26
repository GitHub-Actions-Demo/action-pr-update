import * as core from '@actions/core'
import * as github from '@actions/github';

async function run() {
  try {
    const token = core.getInput('token');
    const label = core.getInput('label');
    const workflow_id = core.getInput('workflow_id');
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
      await octokit.rest.issues.addLabels({
        owner: repoOwner,
        repo: repo,
        issue_number: pr.number,
        labels: [label]
      });
      return octokit.rest.actions.createWorkflowDispatch({
        owner: repoOwner,
        repo: repo,
        workflow_id: workflow_id,
        ref: pr.head.ref,
        inputs: {
          'pr-number': `${pr.number}`,
          'pr-context': JSON.stringify(pr),
          'git-filter': `${pr.merge_commit_sha}:refs/remotes/pull/${pr.number}/merge`,
        }
      });
    })
    await Promise.all(promises);
  } catch (error) {
    core.setFailed(error.message);
  }
}
run();
