const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000; // Replit sets PORT automatically
const REPLIES_FILE = path.join(__dirname, 'replies.json');

app.use(express.json());
app.use(express.static(__dirname));

// Ensure replies file exists
function getReplies() {
  try {
    const data = fs.readFileSync(REPLIES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

function saveReplies(replies) {
  fs.writeFileSync(REPLIES_FILE, JSON.stringify(replies, null, 2), 'utf8');
}

// Save a new reply (called when user submits the form)
app.post('/api/reply', (req, res) => {
  const { reply } = req.body;
  if (!reply || typeof reply !== 'string') {
    return res.status(400).json({ error: 'Reply text is required' });
  }
  const replies = getReplies();
  replies.push({
    reply: reply.trim(),
    time: new Date().toISOString(),
  });
  saveReplies(replies);
  res.json({ success: true });
});

// Get all replies (for your view-replies page)
app.get('/api/replies', (req, res) => {
  const replies = getReplies();
  res.json(replies);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
