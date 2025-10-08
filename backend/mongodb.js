const mongoose = require('mongoose');

// User Schema
const UserSchema = new mongoose.Schema({
  name: { type: String,required:true },
  email: { type: String, required:true },
  password: { type: String,required:true }
});

// Chat Message Schema
const chatMessageSchema = new mongoose.Schema({
  text: { type: String, required: true },
  sender: { type: String, required: true },
  time: { type: Date, default: Date.now }
});

// Chat Session Schema
const chatSessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true },
  messages: { type: [chatMessageSchema], default: [] } // empty array is OK
});

// User Chat Schema
const UserChatSchema = new mongoose.Schema({
  userid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'chatbot_user',
    required: true
  },
  chats: { type: [chatSessionSchema], default: [] } // multiple chat sessions
});

const UserModel = mongoose.model('chatbot_user', UserSchema);
const ChatModel = mongoose.model('chat_history', UserChatSchema);

module.exports = { UserModel, ChatModel };
