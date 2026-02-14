// Vercel serverless function: appends a reply to replies.json in your GitHub repo.
// Set env: GITHUB_TOKEN (PAT with repo scope), GITHUB_REPO_OWNER, GITHUB_REPO_NAME; optional: GITHUB_REPO_BRANCH (default main).

const REPO_OWNER = process.env.GITHUB_REPO_OWNER || '';
const REPO_NAME = process.env.GITHUB_REPO_NAME || '';
const REPO_BRANCH = process.env.GITHUB_REPO_BRANCH || 'main';
const FILE_PATH = 'replies.json';

function cors(headers = {}) {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    ...headers,
  };
}

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token || !REPO_OWNER || !REPO_NAME) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(500).json({ error: 'Server config missing' });
  }

  let reply = (req.body && req.body.reply) || '';
  if (typeof reply !== 'string') reply = '';
  reply = reply.trim();
  if (!reply) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(400).json({ error: 'Reply text required' });
  }

  const apiBase = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;

  try {
    const getRes = await fetch(apiBase + '?ref=' + REPO_BRANCH, {
      headers: { Authorization: 'token ' + token, Accept: 'application/vnd.github.v3+json' },
    });

    let list = [];
    let sha = null;
    if (getRes.ok) {
      const data = await getRes.json();
      sha = data.sha;
      if (data.content) {
        const decoded = Buffer.from(data.content.replace(/\n/g, ''), 'base64').toString('utf8');
        try {
          list = JSON.parse(decoded);
        } catch (_) {}
      }
    }
    if (!Array.isArray(list)) list = [];

    list.push({ reply, time: new Date().toISOString() });
    const content = Buffer.from(JSON.stringify(list, null, 2), 'utf8').toString('base64');

    const putBody = { message: 'Add valentine reply', content, branch: REPO_BRANCH };
    if (sha) putBody.sha = sha;

    const putRes = await fetch(apiBase, {
      method: 'PUT',
      headers: {
        Authorization: 'token ' + token,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(putBody),
    });

    if (!putRes.ok) {
      const err = await putRes.text();
      console.error('GitHub API error:', putRes.status, err);
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.status(502).json({ error: 'Could not save reply' });
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(500).json({ error: 'Server error' });
  }
};
