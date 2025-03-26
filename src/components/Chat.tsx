import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Box, 
  Container, 
  TextField, 
  Button, 
  Paper, 
  Typography, 
  IconButton, 
  Chip,
  Grid,
  Divider,
  Tooltip,
  CircularProgress
} from '@mui/material';
import { 
  Send as SendIcon, 
  Mic as MicIcon, 
  MicOff as MicOffIcon,
  AttachFile as AttachFileIcon,
  Image as ImageIcon,
  VideoCall as VideoCallIcon,
  EmojiEmotions as EmojiIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';

interface Message {
  text: string;
  sender: 'user' | 'ai';
  timestamp: string;
  type?: 'text' | 'image' | 'file' | 'video';
  status?: 'sending' | 'sent' | 'error';
}

const quickQuestions: string[] = [
  "What are the symptoms of COVID-19?",
  "How to manage stress?",
  "Tips for better sleep",
  "Healthy diet recommendations",
  "Exercise guidelines",
  "Mental health support",
  "Chronic pain management",
  "Weight loss advice"
];

const Chat: React.FC = () => {
  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);
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
        timestamp: new Date().toISOString(),
        status: 'sending'
      };
      setMessages([...messages, newMessage]);
      setMessage('');
      setIsTyping(true);
      
      // Simulate AI response
      setTimeout(() => {
        const aiResponse: Message = {
          text: "I'm your AI medical assistant. I can help you with medical information, symptom analysis, and health recommendations. What specific concerns do you have?",
          sender: 'ai',
          timestamp: new Date().toISOString(),
          status: 'sent'
        };
        setMessages(prev => [...prev, aiResponse]);
        setIsTyping(false);
      }, 2000);
    }
  };

  const handleQuickQuestion = (question: string): void => {
    setMessage(question);
  };

  const toggleRecording = (): void => {
    setIsRecording(!isRecording);
    // TODO: Implement voice recording functionality
  };

  const handleFileUpload = (): void => {
    // TODO: Implement file upload functionality
  };

  const handleImageUpload = (): void => {
    // TODO: Implement image upload functionality
  };

  const handleVideoCall = (): void => {
    // TODO: Implement video call functionality
  };

  return (
    <Box sx={{ flexGrow: 1, py: 4 }}>
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ height: '80vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}>
          {/* Chat Header */}
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h6" sx={{ color: 'primary.main' }}>
                Dr.AI Assistant
              </Typography>
              <Chip 
                label="Online" 
                color="success" 
                size="small" 
                sx={{ height: 20 }}
              />
            </Box>
            <Box>
              <Tooltip title="Video Call">
                <IconButton size="small" onClick={handleVideoCall}>
                  <VideoCallIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="More Options">
                <IconButton size="small">
                  <MoreVertIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Quick Questions */}
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="subtitle2" gutterBottom sx={{ color: 'text.secondary' }}>
              Quick Questions
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {quickQuestions.map((question, index) => (
                <motion.div key={index} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Chip 
                    label={question} 
                    onClick={() => handleQuickQuestion(question)} 
                    sx={{ m: 0.5 }}
                  />
                </motion.div>
              ))}
            </Box>
          </Box>

          {/* Messages Area */}
          <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {messages.map((msg, index) => (
              <motion.div 
                key={index} 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.3 }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start', 
                  mb: 1 
                }}>
                  <Paper 
                    elevation={1} 
                    sx={{ 
                      p: 2, 
                      maxWidth: '70%', 
                      bgcolor: msg.sender === 'user' ? 'primary.main' : 'grey.100',
                      color: msg.sender === 'user' ? 'white' : 'text.primary',
                      borderRadius: 2,
                      position: 'relative'
                    }}
                  >
                    <Typography variant="body1">{msg.text}</Typography>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'flex-end',
                      mt: 1,
                      gap: 1
                    }}>
                      <Typography variant="caption" sx={{ opacity: 0.7 }}>
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </Typography>
                      {msg.status === 'sending' && (
                        <CircularProgress size={12} sx={{ color: 'inherit' }} />
                      )}
                    </Box>
                  </Paper>
                </Box>
              </motion.div>
            ))}
            {isTyping && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 1 }}>
                <CircularProgress size={16} />
                <Typography variant="body2" color="text.secondary">
                  Dr.AI is typing...
                </Typography>
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Box>

          {/* Input Area */}
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <Grid container spacing={1} alignItems="center">
              <Grid item>
                <Tooltip title="Attach File">
                  <IconButton onClick={handleFileUpload}>
                    <AttachFileIcon />
                  </IconButton>
                </Tooltip>
              </Grid>
              <Grid item>
                <Tooltip title="Upload Image">
                  <IconButton onClick={handleImageUpload}>
                    <ImageIcon />
                  </IconButton>
                </Tooltip>
              </Grid>
              <Grid item>
                <Tooltip title="Emoji">
                  <IconButton>
                    <EmojiIcon />
                  </IconButton>
                </Tooltip>
              </Grid>
              <Grid item xs>
                <TextField 
                  fullWidth 
                  variant="outlined" 
                  placeholder="Type your medical question..." 
                  value={message} 
                  onChange={(e) => setMessage(e.target.value)} 
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()} 
                  size="small"
                />
              </Grid>
              <Grid item>
                <Tooltip title={isRecording ? "Stop Recording" : "Start Recording"}>
                  <IconButton 
                    onClick={toggleRecording} 
                    color={isRecording ? 'error' : 'primary'}
                  >
                    {isRecording ? <MicOffIcon /> : <MicIcon />}
                  </IconButton>
                </Tooltip>
              </Grid>
              <Grid item>
                <IconButton 
                  onClick={handleSend} 
                  color="primary" 
                  disabled={!message.trim()}
                >
                  <SendIcon />
                </IconButton>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Chat; 