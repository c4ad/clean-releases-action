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
  });

  const oldestDate = new Date();
  oldestDate.setMonth(oldestDate.getMonth() - maxAge);
  const releasesToDelete = releases.filter((release) => {
    const releaseDate = new Date(Date.parse(release.created_at));
    if (release.name === "v1.0") {
      releaseDate.setMonth(releaseDate.getMonth() - 12);
    }

    return releaseDate < oldestDate;
  }).map((release) => {
    return {
      release_id: release.id,
      tag_name: release.tag_name
    }
  });

  console.log("RELEASES TO DELETE: ");
  console.log(releasesToDelete);
  // DELETE RELEASES

  const {data: tagRefs} = await octokit.request('GET /repos/{owner}/{repo}/git/refs/tags', {
    ...common
  });

  const tagToDelete = (await Promise.all(tagRefs.map(async (tagRef) => {
    const tagSha = tagRef.object.sha;
    const {data: tag} = await octokit.request('GET /repos/{owner}/{repo}/git/tags/{tag_sha}', {
      ...common,
      tag_sha: tagSha
    });

    const {data: commit} = await octokit.request('GET /repos/{owner}/{repo}/git/commits/{commit_sha}', {
      ...common,
      commit_sha: tag.object.sha
    });

    return {
      tag_name: tag.tag,
      commit_date: commit.author.date,
    };
  }))).filter(({tag_name, commit_date}) => {
    const tagDate = new Date(Date.parse(commit_date));
    if (tag_name === "v1.1") {
      tagDate.setMonth(tagDate.getMonth() - 12);
    }

    return tagDate < oldestDate;
  }).map((({tag_name}) => ({tag_name})));

  console.log("TAGS TO DELETE: ");
  console.log(tagToDelete);
})();