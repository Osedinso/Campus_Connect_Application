const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb://localhost/campusconnect', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Message Schema
const messageSchema = new mongoose.Schema({
  chatId: String,
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  content: String,
  timestamp: { type: Date, default: Date.now },
  status: { type: String, enum: ['sent', 'delivered', 'read'], default: 'sent' }
});

const Message = mongoose.model('Message', messageSchema);

// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
});

const User = mongoose.model('User', userSchema);

// Chat Schema
const chatSchema = new mongoose.Schema({
  name: String,
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

const Chat = mongoose.model('Chat', chatSchema);

// Socket.IO
io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('join chat', (chatId) => {
    socket.join(chatId);
    console.log(`User joined chat: ${chatId}`);
  });

  socket.on('leave chat', (chatId) => {
    socket.leave(chatId);
    console.log(`User left chat: ${chatId}`);
  });

  socket.on('new message', async (messageData) => {
    try {
      const newMessage = new Message(messageData);
      await newMessage.save();
      io.to(messageData.chatId).emit('message', newMessage);
    } catch (error) {
      console.error('Error saving message:', error);
    }
  });

  socket.on('typing', ({ chatId, userId, isTyping }) => {
    socket.to(chatId).emit('typing', { userId, isTyping });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Routes

// Get all chats for a user
app.get('/api/user/:userId/chats', async (req, res) => {
  try {
    const chats = await Chat.find({ participants: req.params.userId });
    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get messages for a chat
app.get('/api/chat/:chatId/messages', async (req, res) => {
  try {
    const messages = await Message.find({ chatId: req.params.chatId })
      .sort({ timestamp: -1 })
      .limit(50);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Send a message
app.post('/api/chat/:chatId/message', async (req, res) => {
  try {
    const newMessage = new Message({
      chatId: req.params.chatId,
      sender: req.body.userId,
      content: req.body.content,
    });
    await newMessage.save();
    io.to(req.params.chatId).emit('new message', newMessage);
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));