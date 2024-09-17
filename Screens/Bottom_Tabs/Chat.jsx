import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, SafeAreaView, StyleSheet, Alert } from 'react-native';
import { io } from 'socket.io-client';
import axios from 'axios';
import * as DocumentPicker from 'expo-document-picker';

const BACKEND_URL = 'http://localhost:3000'; // Update this with your actual backend URL
const socket = io(BACKEND_URL);

const ChatPage = ({ userId }) => {
  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to Socket.IO');
    });
  
    socket.on('connect_error', (error) => {
      console.log('Socket.IO connection error:', error);
    });
  
    return () => {
      socket.off('connect');
      socket.off('connect_error');
    };
  }, []);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [groupChats, setGroupChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isTyping, setIsTyping] = useState({});
  const flatListRef = useRef(null);

  useEffect(() => {
    fetchGroupChats();
    
    socket.on('new message', (message) => {
      setMessages(prevMessages => [message, ...prevMessages]);
      scrollToBottom();
      handleMessageDelivered(message._id);
    });

    socket.on('typing', ({ chatId, userId: typingUserId, isTyping }) => {
      if (chatId === currentChatId) {
        setIsTyping(prev => ({ ...prev, [typingUserId]: isTyping }));
      }
    });

    socket.on('message status', ({ messageId, status }) => {
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg._id === messageId ? { ...msg, status } : msg
        )
      );
    });

    return () => {
      socket.off('new message');
      socket.off('typing');
      socket.off('message status');
    };
  }, [userId, currentChatId]);

  useEffect(() => {
    if (currentChatId) {
      socket.emit('join chat', currentChatId);
      setMessages([]);
      setPage(1);
      setHasMore(true);
      fetchMessages(currentChatId);
    }

    return () => {
      if (currentChatId) {
        socket.emit('leave chat', currentChatId);
      }
    };
  }, [currentChatId]);

  const fetchGroupChats = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/user/${userId}/chats`);
      setGroupChats(response.data);
      if (response.data.length > 0) {
        setCurrentChatId(response.data[0]._id);
      }
    } catch (error) {
      console.error('Error fetching group chats:', error);
      Alert.alert('Error', 'Failed to fetch group chats. Please try again.');
    }
  };

  const fetchMessages = async (chatId, pageNumber = 1) => {
    if (isLoading || (!hasMore && pageNumber !== 1)) return;

    setIsLoading(true);
    try {
      const response = await axios.get(`${BACKEND_URL}/api/chat/${chatId}/messages`, {
        params: { page: pageNumber, limit: 20 }
      });
      
      const newMessages = response.data.messages;
      setMessages(prevMessages => [...prevMessages, ...newMessages]);
      setPage(pageNumber);
      setHasMore(newMessages.length === 20);

      newMessages.forEach(message => {
        if (message.sender._id !== userId && message.status !== 'read') {
          handleMessageRead(message._id);
        }
      });
    } catch (error) {
      console.error('Error fetching messages:', error);
      Alert.alert('Error', 'Failed to fetch messages. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (inputMessage.trim() !== '' && currentChatId) {
      const tempId = Date.now().toString();
      const tempMessage = {
        _id: tempId,
        chatId: currentChatId,
        sender: { _id: userId },
        content: inputMessage,
        timestamp: new Date(),
        status: 'sending'
      };

      setMessages(prevMessages => [tempMessage, ...prevMessages]);
      setInputMessage('');
      scrollToBottom();

      try {
        const response = await axios.post(`${BACKEND_URL}/api/chat/${currentChatId}/message`, {
          userId,
          content: inputMessage
        });
        
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg._id === tempId ? { ...response.data, status: 'sent' } : msg
          )
        );
      } catch (error) {
        console.error('Error sending message:', error);
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg._id === tempId ? { ...msg, status: 'failed' } : msg
          )
        );
        Alert.alert('Error', 'Failed to send message. Please try again.');
      }
    }
  };

  const handleFileUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync();
      if (result.type === 'success' && currentChatId) {
        const formData = new FormData();
        formData.append('file', {
          uri: result.uri,
          type: result.mimeType,
          name: result.name
        });

        const uploadResponse = await axios.post(`${BACKEND_URL}/api/upload`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        const messageResponse = await axios.post(`${BACKEND_URL}/api/chat/${currentChatId}/message`, {
          userId,
          content: `File: ${result.name}`,
          fileUrl: uploadResponse.data.fileUrl
        });

        setMessages(prevMessages => [messageResponse.data, ...prevMessages]);
        scrollToBottom();
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      Alert.alert('Error', 'Failed to upload file. Please try again.');
    }
  };

  const handleTyping = (isTyping) => {
    socket.emit('typing', { chatId: currentChatId, userId, isTyping });
  };

  const handleMessageDelivered = (messageId) => {
    socket.emit('message delivered', { messageId, chatId: currentChatId });
  };

  const handleMessageRead = (messageId) => {
    socket.emit('message read', { messageId, chatId: currentChatId });
  };

  const scrollToBottom = () => {
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({ animated: true, offset: 0 });
    }
  };

  const renderMessage = ({ item }) => (
    <View style={[styles.messageBubble, item.sender._id === userId ? styles.userMessage : styles.otherMessage]}>
      <Text style={styles.senderName}>{item.sender.name}</Text>
      <Text>{item.content}</Text>
      {item.fileUrl && (
        <TouchableOpacity onPress={() => {/* Implement file viewing logic */}}>
          <Text style={styles.fileLink}>View File</Text>
        </TouchableOpacity>
      )}
      <Text style={styles.messageStatus}>
        {item.status === 'sending' && 'Sending...'}
        {item.status === 'sent' && 'Sent'}
        {item.status === 'delivered' && 'Delivered'}
        {item.status === 'read' && 'Read'}
        {item.status === 'failed' && 'Failed to send'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>CampusConnect Chat</Text>
      </View>
      
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item._id || item.timestamp.toString()}
        inverted
        onEndReached={() => {
          if (hasMore && !isLoading) {
            fetchMessages(currentChatId, page + 1);
          }
        }}
        onEndReachedThreshold={0.1}
        ListFooterComponent={isLoading ? <Text>Loading...</Text> : null}
      />
      
      <View style={styles.chatSelector}>
        {groupChats.map((chat) => (
          <TouchableOpacity
            key={chat._id}
            style={[styles.chatButton, currentChatId === chat._id && styles.activeChatButton]}
            onPress={() => setCurrentChatId(chat._id)}
          >
            <Text style={styles.chatButtonText}>{chat.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {Object.keys(isTyping).length > 0 && (
        <Text style={styles.typingIndicator}>
          {Object.keys(isTyping).filter(id => isTyping[id]).length} user(s) typing...
        </Text>
      )}
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputMessage}
          onChangeText={(text) => {
            setInputMessage(text);
            handleTyping(text.length > 0);
          }}
          placeholder="Type a message..."
          onBlur={() => handleTyping(false)}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.uploadButton} onPress={handleFileUpload}>
          <Text style={styles.uploadButtonText}>Upload</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#4A90E2',
    padding: 15,
  },
  headerText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  messageBubble: {
    padding: 10,
    marginVertical: 5,
    marginHorizontal: 10,
    borderRadius: 10,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C6',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
  },
  senderName: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  fileLink: {
    color: 'blue',
    textDecorationLine: 'underline',
    marginTop: 5,
  },
  messageStatus: {
    fontSize: 10,
    color: 'gray',
    alignSelf: 'flex-end',
    marginTop: 5,
  },
  chatSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
  },
  chatButton: {
    padding: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 5,
  },
  activeChatButton: {
    backgroundColor: '#4A90E2',
  },
  chatButtonText: {
    color: 'black',
  },
  typingIndicator: {
    padding: 10,
    fontStyle: 'italic',
    color: 'gray',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  uploadButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    justifyContent: 'center',
    marginLeft: 5,
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default ChatPage;