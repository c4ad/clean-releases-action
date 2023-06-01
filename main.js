const core = require('@actions/core');
const github = require('@actions/github');

(async () => {
  const GITHUB_TOKEN = core.getInput("token");
  const maxAge = core.getInput("age");

  const octokit = github.getOctokit(GITHUB_TOKEN);

  const owner = github.context.payload.repository?.owner.login || "ofrank123";
  const repo = github.context.payload.repository?.name || "action-test";

  const common = {
    owner,
    repo,
    headers: {
      'X-GitHub-Api-Version': '2022-11-28'
    }
  }

  const {data: releases} = await octokit.request('GET /repos/{owner}/{repo}/releases', {
    ...common
  })

  console.log(releases);

  const oldestDate = new Date();
  oldestDate.setMonth(oldestDate.getMonth() - maxAge);
  const releasesToDelete = releases.filter((release) => {
    const releaseDate = new Date(Date.parse(release.created_at));
    // releaseDate.setMonth(releaseDate.getMonth() - 12);

    return releaseDate < oldestDate;
  });

  console.log("TO DELETE: ");
  console.log(releasesToDelete);
})();