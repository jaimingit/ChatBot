const express = require('express');
const app = express();
const cores = require('cors');
app.use(cores());
const port = 3000;
const mongoose = require('mongoose');
require('dotenv').config();
const model=require('./mongodb');
app.use(express.json());
const authenticateToken = require('./middleware/auth');
const Login = require('./pages/Login');
const Register = require('./pages/Register');
const Chat = require('./pages/Chat');
const Chathistory = require('./pages/Chathistory');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL,).then(()=>{
    console.log("Connected to MongoDB");
})

app.use('/api/login',Login);
app.use('/api/register',Register);
app.use('/api/chat',Chat)
app.use('/api/chathistory',Chathistory)

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
