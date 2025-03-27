import express from 'express';
import { auth } from '../middleware/auth';
import { Chat } from '../models/Chat';
import OpenAI from 'openai';

const router = express.Router();

// Initialize OpenAI with API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Get chat history
router.get('/history', auth, async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching chat history' });
  }
});

// Create new chat
router.post('/new', auth, async (req, res) => {
  try {
    const chat = new Chat({
      userId: req.user.id,
      title: 'New Chat',
      messages: []
    });
    await chat.save();
    res.status(201).json(chat);
  } catch (error) {
    res.status(500).json({ message: 'Error creating new chat' });
  }
});

// Send message and get AI response
router.post('/message', auth, async (req, res) => {
  try {
    const { chatId, message } = req.body;
    const chat = await Chat.findOne({ _id: chatId, userId: req.user.id });
    
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Add user message
    chat.messages.push({ role: 'user', content: message });
    await chat.save();

    // Get AI response
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: chat.messages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }))
    });

    const aiResponse = completion.choices[0].message.content;

    // Add AI response to chat
    chat.messages.push({ role: 'assistant', content: aiResponse });
    await chat.save();

    res.json({ message: aiResponse });
  } catch (error) {
    res.status(500).json({ message: 'Error processing message' });
  }
});

export default router; 