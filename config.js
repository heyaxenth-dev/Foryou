// 6-digit PIN gate (date 09-01-99 → PIN 090199). Set to '' or null to disable.
window.BIRTHDAY_GATE = '090199';

// GitHub repo for viewing replies (loads replies.json from repo).
window.GITHUB_REPLIES = {
	user: 'heyaxenth-dev',
	repo: 'Foryou',
	branch: 'main',
};

// API URL that appends replies to replies.json (Vercel serverless).
// Deploy this repo to Vercel and set env: GITHUB_TOKEN, GITHUB_REPO_OWNER, GITHUB_REPO_NAME.
window.REPLY_API_URL = '';

// Formspree form ID — you get replies by email. Get yours at https://formspree.io (e.g. formspree.io/f/xyzabc → "xyzabc").
window.FORMSPREE_FORM_ID = 'xbdaolog';
