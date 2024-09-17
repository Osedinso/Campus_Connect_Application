const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// Middleware
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost/campusconnect', { useNewUrlParser: true, useUnifiedTopology: true });

// Models
const User = mongoose.model('User', {
  name: String,
  email: String,
  classSchedule: [{ courseId: String, courseName: String }]
});

const Message = mongoose.model('Message', {
  chatId: String,
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  content: String,
  timestamp: Date,
  fileUrl: String,
  status: { type: String, enum: ['sending', 'sent', 'delivered', 'read', 'failed'], default: 'sending' }
});

const GroupChat = mongoose.model('GroupChat', {
  name: String,
  courseId: String,
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Routes

// Fetch user's class schedule and group chats
app.get('/api/user/:userId/chats', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    const groupChats = await GroupChat.find({ 
      courseId: { $in: user.classSchedule.map(c => c.courseId) } 
    });
    res.json(groupChats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Send a message
app.post('/api/chat/:chatId/message', async (req, res) => {
  try {
    const message = new Message({
      chatId: req.params.chatId,
      sender: req.body.userId,
      content: req.body.content,
      timestamp: new Date(),
      fileUrl: req.body.fileUrl,
      status: 'sent'
    });
    await message.save();
    
    // Emit the message to all users in the chat
    io.to(req.params.chatId).emit('new message', message);
    
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Fetch messages for a specific chat
app.get('/api/chat/:chatId/messages', async (req, res) => {
  try {
    const { chatId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const messages = await Message.find({ chatId })
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('sender', 'name')
      .exec();

    const count = await Message.countDocuments({ chatId });

    res.json({
      messages,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Upload file
app.post('/api/upload', upload.single('file'), async (req, res) => {
  if (req.file) {
    res.json({ fileUrl: `/uploads/${req.file.filename}` });
  } else {
    res.status(400).json({ message: 'No file uploaded' });
  }
});

// Socket.io connection
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('join chat', (chatId) => {
    socket.join(chatId);
  });

  socket.on('leave chat', (chatId) => {
    socket.leave(chatId);
  });

  socket.on('typing', ({ chatId, userId, isTyping }) => {
    socket.to(chatId).emit('typing', { chatId, userId, isTyping });
  });

  socket.on('message delivered', async ({ messageId, chatId }) => {
    try {
      const message = await Message.findByIdAndUpdate(messageId, { status: 'delivered' }, { new: true });
      io.to(chatId).emit('message status', { messageId, status: 'delivered' });
    } catch (error) {
      console.error('Error updating message status:', error);
    }
  });

  socket.on('message read', async ({ messageId, chatId }) => {
    try {
      const message = await Message.findByIdAndUpdate(messageId, { status: 'read' }, { new: true });
      io.to(chatId).emit('message status', { messageId, status: 'read' });
    } catch (error) {
      console.error('Error updating message status:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Start server
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => console.log(`Server running on port ${PORT}`));