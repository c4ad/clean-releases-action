const core = require('@actions/core');
const github = require('@actions/github');

(async () => {
  const GITHUB_TOKEN = core.getInput("token");
  const octokit = github.getOctokit(GITHUB_TOKEN);

  const owner = github.context.payload.repository.owner.login || "ofrank123";
  const repo = github.context.payload.repository.name;


  const { data: pullRequest } = await octokit.rest.pulls.get({
    owner,
    repo,
    pull_number: 1,
  });

  console.log(pullRequest);
})();