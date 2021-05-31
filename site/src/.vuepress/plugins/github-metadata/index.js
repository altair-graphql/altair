// https://github.com/jekyll/github-metadata/blob/master/docs/site.github.md
// https://octokit.github.io/rest.js/v18#repos-get-latest-release
// https://www.npmjs.com/package/node-cache
const { Octokit } = require('@octokit/rest');

module.exports = (options = {}, context) => ({
  async extendPageData ($page) {
    const { owner, repo } = options;
    $page.githubMetadata = await getGithubMetadata({ owner, repo });
  }
});

const getGithubMetadata = async ({ owner = '', repo = '' }) => {
  const octokit = new Octokit();

  const repoUrl = `https://github.com/${owner}/${repo}`;

  const resolvers = {
    latest_release: async () => {
      const { data } = await octokit.rest.repos.getLatestRelease({ owner, repo });
      return data;
    },
    releases: async () => {
      const { data } = await octokit.rest.repos.listReleases({ owner, repo });
      return data;
    },
    releases_url: async () => `${repoUrl}/releases`,
  }
  const keys = Object.keys(resolvers);
  const vls = await Promise.allSettled(keys.map(_ => resolvers[_]()));

  return vls.reduce((acc, cur, i) => {
    return {
      ...acc,
      [keys[i]]: cur.value,
    }
  }, {});
};
