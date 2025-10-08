const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { ChatModel } = require('../mongodb');

router.get('/show',async(req,res)=>{
  const show=await ChatModel.findOne()
  res.json(show)
})

// Get chat history for user
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId))
      return res.status(400).json({ error: "Invalid user ID" });

    const userid = new mongoose.Types.ObjectId(userId);
    const userchat = await ChatModel.findOne({ userid }).populate("userid", "name email");

    if (!userchat) return res.json({ userid, chats: [] });

    res.json(userchat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Create new chat session
router.post('/new/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId))
      return res.status(400).json({ error: "Invalid user ID" });

    const userid = new mongoose.Types.ObjectId(userId);

    const newChatSession = {
      sessionId: Date.now().toString(),
      messages: []
    };

    let userchat = await ChatModel.findOne({ userid });
    if (!userchat) {
      userchat = new ChatModel({ userid, chats: [newChatSession] });
    } else {
      userchat.chats.push(newChatSession);
    }

    await userchat.save();
    res.json(newChatSession);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Add message to chat session
router.post('/message', async (req, res) => {
  try {
    const { userId, sessionId, messages } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId))
      return res.status(400).json({ error: "Invalid user ID" });

    const userid = new mongoose.Types.ObjectId(userId);
    const userchat = await ChatModel.findOne({ userid });

    if (!userchat) return res.status(404).json({ error: "User chat not found" });

    // Push each message only if it has text and sender
    messages.forEach(msg => {
      if (msg.text && msg.sender) {
        const chatSession = userchat.chats.find(c => c.sessionId === sessionId);
        if (chatSession) {
          chatSession.messages.push({
            text: msg.text,
            sender: msg.sender,
            time: msg.time || Date.now()
          });
        }
      }
    });

    await userchat.save();
    res.json({ message: "Message added" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Delete chat session
router.delete('/:userId/:chatId', async (req, res) => {
  try {
    const { userId, chatId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId))
      return res.status(400).json({ error: "Invalid user ID" });

    const userid = new mongoose.Types.ObjectId(userId);

    await ChatModel.updateOne(
      { userid },
      { $pull: { chats: { sessionId: chatId } } }
    );

    res.json({ message: "Chat session deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
