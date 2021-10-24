// https://github.com/jekyll/github-metadata/blob/master/docs/site.github.md
// https://octokit.github.io/rest.js/v18#repos-get-latest-release
const fs = require('fs');
const path = require('path');
const { Octokit } = require('@octokit/rest');
const NodeCache = require('node-cache');
// Does the cache persist over several runs? 🤔
const myCache = new NodeCache( { stdTTL: 600 } );

module.exports = (options = {}, context) => ({
  async extendPageData ($page) {
    const { owner, repo } = options;
    $page.githubMetadata = await getGithubMetadata({ owner, repo });
  }
});

const getGithubMetadata = async ({ owner = '', repo = '' }) => {
  
  let githubToken = process.env.GITHUB_TOKEN || '';
  try {
    githubToken = fs.readFileSync(path.resolve(__dirname, './github-token'), 'utf-8');
  } catch (error) {
    console.log('no github token found');
  }
  const octokit = new Octokit({
    auth: githubToken || undefined,
  });

  const repoUrl = `https://github.com/${owner}/${repo}`;

  const resolvers = {
    latest_release: async () => {
      const fromCache = myCache.get('latest_release');
      if (fromCache) {
        return fromCache;
      }
      const { data } = await octokit.rest.repos.getLatestRelease({ owner, repo });
      if (data) {
        myCache.set('latest_release', data);
      }
      return data;
    },
    releases: async () => {
      const fromCache = myCache.get('releases');
      if (fromCache) {
        return fromCache;
      }
      const { data } = await octokit.rest.repos.listReleases({ owner, repo });
      if (data) {
        myCache.set('releases', data);
      }
      return data;
    },
    releases_url: async () => `${repoUrl}/releases`,
  }
  const keys = Object.keys(resolvers);
  const vls = await Promise.allSettled(keys.map(_ => resolvers[_]()));

  return vls.reduce((acc, cur, i) => {
    if (cur.status === 'rejected') {
      console.log(cur);
    }
    return {
      ...acc,
      [keys[i]]: cur.value,
    }
  }, {});
};
