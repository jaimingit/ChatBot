const express = require('express');
const router = express.Router();
const cors = require('cors');
require('dotenv').config();

router.use(cors());
router.use(express.json());
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));


router.post('/', async (req, res) => {
  try {
    const userMessage = req.body.message;
    if (!userMessage) {
      return res.status(400).json({ error: "Message is required" });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.API}` 
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: userMessage }]
      })
    });

    const data = await response.json();

    const reply = data.choices?.[0]?.message?.content;
    if (!reply) {
      return res.status(500).json({ error: "No reply from AI" });
    }

    res.json({ reply });

  } catch (err) {
    console.error("API Error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

module.exports = router;
