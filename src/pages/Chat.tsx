import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  IconButton,
  Paper,
  Avatar,
  Chip,
  useTheme,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import EmergencyIcon from '@mui/icons-material/Emergency';

const ChatContainer = styled(Box)(({ theme }) => ({
  height: 'calc(100vh - 200px)',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));

const MessagesContainer = styled(Paper)(({ theme }) => ({
  flex: 1,
  overflow: 'auto',
  padding: theme.spacing(2),
  backgroundColor: theme.palette.grey[50],
}));

const MessageBubble = styled(Box)<{ isUser: boolean }>(({ theme, isUser }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(2),
  flexDirection: isUser ? 'row-reverse' : 'row',
}));

const MessageContent = styled(Box)<{ isUser: boolean }>(({ theme, isUser }) => ({
  maxWidth: '70%',
  padding: theme.spacing(2),
  borderRadius: theme.spacing(2),
  backgroundColor: isUser ? theme.palette.primary.main : 'white',
  color: isUser ? 'white' : theme.palette.text.primary,
  boxShadow: theme.shadows[1],
}));

const InputContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  padding: theme.spacing(2),
  backgroundColor: 'white',
  borderRadius: theme.spacing(2),
  boxShadow: theme.shadows[2],
}));

const EmergencyBanner = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.error.main,
  color: 'white',
  padding: theme.spacing(1),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  borderRadius: theme.spacing(1),
  marginBottom: theme.spacing(2),
}));

const Chat = () => {
  const theme = useTheme();
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: 'Hello! I\'m your AI Health Assistant. How can I help you today?',
      isUser: false,
    },
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickQuestions = [
    'I have a headache',
    'I feel feverish',
    'I have a cough',
    'I need medical advice',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      text: input,
      isUser: true,
    };

    setMessages([...messages, newMessage]);
    setInput('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: messages.length + 2,
        text: 'I understand you\'re experiencing symptoms. Could you please provide more details about when these symptoms started and their severity?',
        isUser: false,
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        AI Health Assistant
      </Typography>

      <EmergencyBanner>
        <EmergencyIcon />
        <Typography variant="subtitle1">
          For medical emergencies, please call emergency services immediately.
        </Typography>
      </EmergencyBanner>

      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Quick Questions:
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {quickQuestions.map((question, index) => (
            <Chip
              key={index}
              label={question}
              onClick={() => setInput(question)}
              sx={{
                backgroundColor: theme.palette.primary.light,
                color: 'white',
                '&:hover': {
                  backgroundColor: theme.palette.primary.main,
                },
              }}
            />
          ))}
        </Box>
      </Box>

      <ChatContainer>
        <MessagesContainer>
          {messages.map((message) => (
            <MessageBubble key={message.id} isUser={message.isUser}>
              <Avatar
                sx={{
                  bgcolor: message.isUser ? theme.palette.primary.main : theme.palette.secondary.main,
                }}
              >
                {message.isUser ? <PersonIcon /> : <SmartToyIcon />}
              </Avatar>
              <MessageContent isUser={message.isUser}>
                <Typography>{message.text}</Typography>
              </MessageContent>
            </MessageBubble>
          ))}
          <div ref={messagesEndRef} />
        </MessagesContainer>

        <InputContainer>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your health-related question here..."
            variant="outlined"
            size="small"
          />
          <IconButton
            color="primary"
            onClick={handleSend}
            disabled={!input.trim()}
            sx={{
              backgroundColor: theme.palette.primary.main,
              color: 'white',
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
              },
            }}
          >
            <SendIcon />
          </IconButton>
        </InputContainer>
      </ChatContainer>
    </Container>
  );
};

export default Chat; 