import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Box, Container, TextField, Button, Paper, Typography, IconButton, Chip } from '@mui/material';
import { Send as SendIcon, Mic as MicIcon, MicOff as MicOffIcon } from '@mui/icons-material';

interface Message {
  text: string;
  sender: 'user' | 'ai';
  timestamp: string;
}

const quickQuestions: string[] = [
  "What are the symptoms of COVID-19?",
  "How to manage stress?",
  "Tips for better sleep",
  "Healthy diet recommendations",
  "Exercise guidelines"
];

const Chat: React.FC = () => {
  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (): void => {
    if (message.trim()) {
      const newMessage: Message = {
        text: message,
        sender: 'user',
        timestamp: new Date().toISOString()
      };
      setMessages([...messages, newMessage]);
      setMessage('');
      
      // Simulate AI response
      setTimeout(() => {
        const aiResponse: Message = {
          text: "I'm your AI medical assistant. How can I help you today?",
          sender: 'ai',
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, aiResponse]);
      }, 1000);
    }
  };

  const handleQuickQuestion = (question: string): void => {
    setMessage(question);
  };

  const toggleRecording = (): void => {
    setIsRecording(!isRecording);
    // TODO: Implement voice recording functionality
  };

  return (
    <Box sx={{ flexGrow: 1, py: 4 }}>
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ height: '70vh', display: 'flex', flexDirection: 'column', p: 2, bgcolor: 'background.paper' }}>
          <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
            Chat with AI Medical Assistant
          </Typography>
          
          <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {quickQuestions.map((question, index) => (
              <motion.div key={index} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Chip label={question} onClick={() => handleQuickQuestion(question)} sx={{ m: 0.5 }} />
              </motion.div>
            ))}
          </Box>

          <Box sx={{ flexGrow: 1, overflowY: 'auto', mb: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {messages.map((msg, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <Box sx={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start', mb: 1 }}>
                  <Paper elevation={1} sx={{ p: 2, maxWidth: '70%', bgcolor: msg.sender === 'user' ? 'primary.main' : 'grey.100', color: msg.sender === 'user' ? 'white' : 'text.primary', borderRadius: 2 }}>
                    <Typography variant="body1">{msg.text}</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.7 }}>
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </Typography>
                  </Paper>
                </Box>
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton onClick={toggleRecording} color={isRecording ? 'error' : 'primary'}>
              {isRecording ? <MicOffIcon /> : <MicIcon />}
            </IconButton>
            <TextField 
              fullWidth 
              variant="outlined" 
              placeholder="Type your medical question..." 
              value={message} 
              onChange={(e) => setMessage(e.target.value)} 
              onKeyPress={(e) => e.key === 'Enter' && handleSend()} 
            />
            <IconButton onClick={handleSend} color="primary" disabled={!message.trim()}>
              <SendIcon />
            </IconButton>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Chat; 