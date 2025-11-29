'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Paperclip, FileText, Download, Mic, MicOff, Volume2, Settings, Maximize2, Minimize2, History, Plus, Trash2 } from 'lucide-react';
import dynamic from 'next/dynamic';

import { useAuth } from '@/lib/auth/auth-context';
import { cn } from '@/lib/utils';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import apiClient from '@/lib/apiClient';

// Lazy load markdown rendering library to reduce initial bundle size (200KB saved)
const ReactMarkdown = dynamic(() => import('react-markdown'), {
  loading: () => <div className="text-sm text-gray-500 italic">Loading...</div>,
  ssr: false
});

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot' | 'error';
  timestamp: Date;
  quickReplies?: Array<{ text: string }>;
  isTyping?: boolean;
  attachments?: Array<{
    name: string;
    size: number;
    type: string;
    url?: string;
    base64?: string;
  }>;
}

interface ChatSession {
  id: string;
  session_token: string;
  started_at: string;
  last_activity: string;
  summary: string;
}

interface ChatbotWidgetProps {
  className?: string;
}

export function ChatbotWidget({ className }: ChatbotWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [attachments, setAttachments] = useState<Array<{
    name: string;
    size: number;
    type: string;
    file: File;
    base64: string;
  }>>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [remarkGfmPlugin, setRemarkGfmPlugin] = useState<any>(null);

  // History State
  const [showHistory, setShowHistory] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Debug/Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [debugRole, setDebugRole] = useState<string>('');
  const [debugStyle, setDebugStyle] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatWidgetRef = useRef<HTMLDivElement>(null);
  const chatButtonRef = useRef<HTMLButtonElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { user, isAuthenticated, getAccessToken } = useAuth();

  // Function to resize textarea
  const resizeTextarea = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  // Function to update input value and resize textarea
  const updateInputValue = (value: string) => {
    setInputValue(value);
    // Trigger resize on next frame
    requestAnimationFrame(() => {
      if (textareaRef.current) {
        resizeTextarea(textareaRef.current);
      }
    });
  };

  // Effect to resize textarea when inputValue changes (e.g., from speech recognition)
  useEffect(() => {
    if (textareaRef.current) {
      resizeTextarea(textareaRef.current);
    }
  }, [inputValue]);

  // Client-side check and load markdown plugin
  useEffect(() => {
    setIsClient(true);
    
    // Lazy load remarkGfm plugin only when needed
    import('remark-gfm').then((module) => {
      setRemarkGfmPlugin(() => module.default);
    }).catch((error) => {
      console.error('Failed to load remark-gfm:', error);
    });
  }, []);

  // Speech recognition hook
  const {
    transcript,
    interimTranscript,
    finalTranscript,
    isListening,
    isSupported: isSpeechSupported,
    startListening,
    stopListening,
    resetTranscript,
    error: speechError
  } = useSpeechRecognition({
    continuous: false,
    interimResults: true,
    lang: 'en-US',
    onTranscript: (transcript) => {
      updateInputValue(inputValue + transcript);
    },
    onError: (error) => {
      console.error('Speech recognition error:', error);
      setIsRecording(false);
      if (error === 'not-allowed') {
        addMessage({
          text: 'Microphone access denied. Please allow microphone access in your browser settings to use voice input.',
          sender: 'error'
        });
      } else if (error === 'network') {
        addMessage({
          text: 'Network error occurred during speech recognition. Please check your internet connection.',
          sender: 'error'
        });
      } else {
        addMessage({
          text: `Speech recognition error: ${error}. Please try again.`,
          sender: 'error'
        });
      }
    }
  });

  // Generate or restore session ID on mount with localStorage persistence
  useEffect(() => {
    if (isAuthenticated && user) {
      if (typeof window !== 'undefined') {
        const STORAGE_KEY = 'edulearn_chat_session';
        const stored = localStorage.getItem(STORAGE_KEY);
        
        if (stored) {
          try {
            const { id, timestamp } = JSON.parse(stored);
            const age = Date.now() - timestamp;
            // Session valid for 24 hours
            if (age < 24 * 60 * 60 * 1000) {
              setSessionId(id);
            } else {
              // Expired, create new session
              const newId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
              localStorage.setItem(STORAGE_KEY, JSON.stringify({
                id: newId,
                timestamp: Date.now()
              }));
              setSessionId(newId);
            }
          } catch {
            // Invalid stored data, create new session
            const newId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
              id: newId,
              timestamp: Date.now()
            }));
            setSessionId(newId);
          }
        } else {
          // No stored session, create new
          const newId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          localStorage.setItem(STORAGE_KEY, JSON.stringify({
            id: newId,
            timestamp: Date.now()
          }));
          setSessionId(newId);
        }
      }
      
      // Initialize debug values
      setDebugRole(user.role);
      setDebugStyle(user.learningStyle || 'General');
    }
  }, [isAuthenticated, user]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize chat session when opened
  useEffect(() => {
    if (isOpen && isAuthenticated && user && messages.length === 0) {
      initializeChatSession();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isAuthenticated, user]);

  // Handle click outside to close chatbot
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      // Only proceed if chatbot is open
      if (!isOpen) return;

      const target = event.target as Element;

      // Make sure we have valid refs
      if (!chatWidgetRef.current) return;

      // Check if click is inside the chat widget
      const isInsideWidget = chatWidgetRef.current.contains(target);

      // Check if click is on the chat button (when it's not visible, this won't matter)
      const isOnButton = chatButtonRef.current && chatButtonRef.current.contains(target);

      // If click is outside both widget and button, close the chat
      if (!isInsideWidget && !isOnButton) {
        setIsOpen(false);
      }
    };

    // Add both mouse and touch event listeners for better mobile support
    document.addEventListener('mousedown', handleClickOutside, true);
    document.addEventListener('touchstart', handleClickOutside, true);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
      document.removeEventListener('touchstart', handleClickOutside, true);
    };
  }, [isOpen]);

  const getRoleSpecificContent = () => {
    if (!user) {
      return {
        welcomeMessage: "Please log in to use the EduLearn Assistant.",
        quickReplies: []
      };
    }

    const roleContent = {
      admin: {
        welcomeMessage: `Hello ${user.firstName}! I'm EduLearn Assistant. As an admin, you have full access.`,
        quickReplies: [
          { text: "Show all users" },
          { text: "Show user statistics" },
          { text: "List all courses" },
          { text: "Show system analytics" },
          { text: "Database schema help" }
        ]
      },
      teacher: {
        welcomeMessage: `Hello ${user.firstName}! I'm EduLearn Assistant. As a teacher, I can help with your courses.`,
        quickReplies: [
          { text: "Show my courses" },
          { text: "Show my students" },
          { text: "Course enrollment stats" },
          { text: "Assignment submissions" },
          { text: "Help with SQL" }
        ]
      },
      student: {
        welcomeMessage: `Hello ${user.firstName}! I'm EduLearn Assistant. I'm here to help you learn!`,
        quickReplies: [
          { text: "Show my courses" },
          { text: "My assignments" },
          { text: "My grades" },
          { text: "Course schedule" },
          { text: "Help with SQL" }
        ]
      }
    };

    return roleContent[user.role as keyof typeof roleContent] || {
      welcomeMessage: "Hello! I'm EduLearn Assistant. How can I help you?",
      quickReplies: [{ text: "Help with SQL" }]
    };
  };

  const initializeChatSession = () => {
    if (!isAuthenticated || !user) {
      addMessage({
        text: "Please log in to use the EduLearn Assistant. You must be authenticated to access this service.",
        sender: 'error'
      });
      return;
    }

    const allowedRoles = ['admin', 'teacher', 'student'];
    if (!allowedRoles.includes(user.role)) {
      addMessage({
        text: "You don't have permission to use the chatbot. Please contact your administrator.",
        sender: 'error'
      });
      return;
    }

    const roleContent = getRoleSpecificContent();
    addMessage({
      text: roleContent.welcomeMessage,
      sender: 'bot',
      quickReplies: roleContent.quickReplies
    });
  };

  const addMessage = (messageData: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      ...messageData
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const sendMessage = async (text: string) => {
    if ((!text.trim() && attachments.length === 0) || !isAuthenticated || !user) return;

    // Prepare message with attachments
    // Always attach files if they exist, not just if text mentions them
    const messageAttachments = attachments.map(att => ({
      name: att.name,
      size: att.size,
      type: att.type,
      base64: att.base64
    }));

    // Add user message
    const userMsgId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newMessage: Message = {
      id: userMsgId,
      text: text || (attachments.length > 0 ? `Sent ${attachments.length} file(s)` : ''),
      sender: 'user',
      timestamp: new Date(),
      attachments: messageAttachments.length > 0 ? messageAttachments : undefined
    };

    setMessages(prev => [...prev, newMessage]);

    // Clear attachments after sending
    setAttachments([]);

    // Add typing indicator
    const typingId = `typing_${Date.now()}`;
    addMessage({
      text: 'typing...',
      sender: 'bot',
      isTyping: true,
      id: typingId
    } as any);

    setIsLoading(true);

    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      // Prepare payload for new API
      // We need to send the conversation history + user profile
      const apiMessages = [...messages, newMessage].map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
        attachments: m.attachments // Pass attachments to API
      }));

      const payload = {
        messages: apiMessages,
        sessionId: sessionId,
        userProfile: {
          role: debugRole || user.role,
          learningStyle: debugStyle || user.learningStyle || 'General'
        }
      };

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Optional if API route is public or handles auth differently
        },
        body: JSON.stringify(payload)
      });

      // Remove typing indicator
      setMessages(prev => prev.filter(msg => !msg.isTyping));

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 429) {
          throw new Error(
            errorData.error || 
            'Rate limit exceeded. Please wait a moment before sending another message.'
          );
        } else if (response.status === 401) {
          throw new Error('Your session has expired. Please log in again.');
        } else {
          throw new Error(
            errorData.error || 
            `Unable to process your request (Error ${response.status}). Please try again.`
          );
        }
      }

      const data = response.body;
      if (!data) return;

      const reader = data.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let botMessage = '';

      // Create bot message placeholder
      const botMsgId = `bot_${Date.now()}`;
      const botMsg: Message = {
        id: botMsgId,
        text: '',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value, { stream: true });
        botMessage += chunkValue;

        setMessages(prev => prev.map(msg =>
          msg.id === botMsgId ? { ...msg, text: botMessage } : msg
        ));
      }

    } catch (error) {
      // Remove typing indicator
      setMessages(prev => prev.filter(msg => !msg.isTyping));

      console.error('Chatbot error:', error);
      
      let errorMessage = 'An unexpected error occurred.';
      let showRetry = true;
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Customize error message based on error type
        if (error.message.includes('Rate limit')) {
          showRetry = false; // Don't show retry for rate limits
        } else if (error.message.includes('session has expired')) {
          showRetry = false; // Don't show retry for auth errors
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your internet connection and try again.';
        }
      }

      addMessage({
        text: `${errorMessage}${showRetry ? '\n\n_Click the send button to retry your message._' : ''}`,
        sender: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickReply = (replyText: string) => {
    sendMessage(replyText);
  };

  const handleSpeechToggle = () => {
    if (isListening) {
      stopListening();
      setIsRecording(false);
    } else {
      if (!isSpeechSupported || !isClient) {
        addMessage({
          text: 'Speech recognition is not supported in your browser. Please use a modern browser like Chrome, Firefox, or Safari.',
          sender: 'error'
        });
        return;
      }

      resetTranscript();
      startListening();
      setIsRecording(true);
    }
  };

  // Handle speech recognition completion
  useEffect(() => {
    if (!isListening && isRecording && finalTranscript) {
      setIsRecording(false);
      // Don't auto-send, just let user review the transcript
    }
  }, [isListening, isRecording, finalTranscript]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      sendMessage(inputValue);
      setInputValue('');
      resetTranscript(); // Clear speech transcript after sending
    } else if (!inputValue.trim() && attachments.length > 0) {
      // If only files are attached without text, send them
      sendMessage('');
    }
  };

  const openChat = () => {
    setIsOpen(true);
    if (!isAuthenticated) {
      addMessage({
        text: "Please log in to use the EduLearn Assistant. You must be authenticated to access this service.",
        sender: 'error'
      });
    }
  };

  // File handling utilities
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data URL prefix to get just the base64 string
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isValidFileType = (file: File): boolean => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'text/csv',
      'image/jpeg',
      'image/png',
      'image/webp'
    ];
    return allowedTypes.includes(file.type);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    await processFiles(Array.from(files));

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Drag and drop functionality
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoading && isAuthenticated) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set drag over to false if we're leaving the chat widget entirely
    if (!chatWidgetRef.current?.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (!isAuthenticated || isLoading) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    await processFiles(files);
  };

  const fetchHistory = async () => {
    if (!isAuthenticated) return;
    setIsLoadingHistory(true);
    try {
      const response = await apiClient.get('/chatbot/sessions');
      if (response.data.success) {
        setChatHistory(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch chat history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const toggleHistory = () => {
    if (!showHistory) {
      fetchHistory();
    }
    setShowHistory(!showHistory);
  };

  const loadSession = async (token: string, cursor?: string) => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      // Use new paginated endpoint with limit of 50 messages
      const params = new URLSearchParams({ limit: '50' });
      if (cursor) {
        params.append('cursor', cursor);
        params.append('direction', 'before');
      }
      const url = `/chatbot/sessions/${token}/messages?${params.toString()}`;
      
      const response = await apiClient.get(url);
      if (response.data.success) {
        const loadedMessages: Message[] = response.data.data.map((msg: any) => ({
          id: msg.id?.toString() || `msg_${Date.now()}_${Math.random()}`,
          text: msg.text,
          sender: msg.sender,
          timestamp: new Date(msg.created_at),
          attachments: (typeof msg.attachments === 'string' ? JSON.parse(msg.attachments) : msg.attachments) || undefined
        }));
        
        if (cursor) {
          // Prepend older messages
          setMessages(prev => [...loadedMessages, ...prev]);
        } else {
          // Initial load
          setMessages(loadedMessages);
          setSessionId(token);
          setShowHistory(false);
        }
        
        // Show message if there are more messages to load
        if (response.data.pagination?.hasMore && !cursor) {
          addMessage({
            text: `_Loaded ${loadedMessages.length} most recent messages. Scroll up to load older messages._`,
            sender: 'bot'
          });
        }
      }
    } catch (error) {
      console.error('Failed to load session:', error);
      addMessage({
        text: 'Failed to load chat session.',
        sender: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startNewChat = () => {
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Update localStorage with new session
    if (typeof window !== 'undefined') {
      const STORAGE_KEY = 'edulearn_chat_session';
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        id: newSessionId,
        timestamp: Date.now()
      }));
    }
    
    setSessionId(newSessionId);
    setMessages([]);
    setShowHistory(false);

    // Re-initialize with welcome message
    const roleContent = getRoleSpecificContent();
    addMessage({
      text: roleContent.welcomeMessage,
      sender: 'bot',
      quickReplies: roleContent.quickReplies
    });
  };

  const deleteSession = async (token: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent loading the session when clicking delete
    if (!isAuthenticated) return;

    if (!confirm('Are you sure you want to delete this chat session?')) return;

    try {
      const response = await apiClient.delete(`/chatbot/sessions/${token}`);
      if (response.data.success) {
        // Remove from history list
        setChatHistory(prev => prev.filter(s => s.session_token !== token));

        // If deleted session is active, clear it
        if (sessionId === token) {
          startNewChat();
        }
      }
    } catch (error) {
      console.error('Failed to delete session:', error);
      addMessage({
        text: 'Failed to delete chat session.',
        sender: 'error'
      });
    }
  };

  const processFiles = async (files: File[]) => {
    // File upload limits
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB per file
    const MAX_FILES = 5; // Maximum 5 files at once
    const MAX_TOTAL_SIZE = 25 * 1024 * 1024; // 25MB total batch size

    // Check file count limit
    const currentFileCount = attachments.length;
    const newFileCount = files.length;
    
    if (currentFileCount + newFileCount > MAX_FILES) {
      addMessage({
        text: `You can only attach up to ${MAX_FILES} files per message. Currently have ${currentFileCount} file(s). Please remove some files before adding more.`,
        sender: 'error'
      });
      return;
    }

    // Calculate total size including existing attachments
    const currentTotalSize = attachments.reduce((sum, att) => sum + att.size, 0);
    const newFilesSize = Array.from(files).reduce((sum, file) => sum + file.size, 0);
    const totalSize = currentTotalSize + newFilesSize;

    if (totalSize > MAX_TOTAL_SIZE) {
      addMessage({
        text: `Total file size cannot exceed ${Math.round(MAX_TOTAL_SIZE / 1024 / 1024)}MB. Current total: ${Math.round(currentTotalSize / 1024 / 1024)}MB, attempting to add: ${Math.round(newFilesSize / 1024 / 1024)}MB.`,
        sender: 'error'
      });
      return;
    }

    const newAttachments: Array<{
      name: string;
      size: number;
      type: string;
      file: File;
      base64: string;
    }> = [];

    let skippedFiles = 0;

    for (const file of files) {
      // Validate file type
      if (!isValidFileType(file)) {
        addMessage({
          text: `File "${file.name}" is not supported. Please upload PDF, Word, Excel, PowerPoint, Text, or Image files.`,
          sender: 'error'
        });
        skippedFiles++;
        continue;
      }

      // Validate individual file size (max 10MB)
      if (file.size > MAX_FILE_SIZE) {
        addMessage({
          text: `File "${file.name}" is too large (${formatFileSize(file.size)}). Maximum file size is ${Math.round(MAX_FILE_SIZE / 1024 / 1024)}MB.`,
          sender: 'error'
        });
        skippedFiles++;
        continue;
      }

      try {
        const base64 = await convertFileToBase64(file);
        newAttachments.push({
          name: file.name,
          size: file.size,
          type: file.type,
          file,
          base64
        });
      } catch (error) {
        addMessage({
          text: `Failed to process file "${file.name}". Please try again.`,
          sender: 'error'
        });
        skippedFiles++;
      }
    }

    if (newAttachments.length > 0) {
      setAttachments(prev => [...prev, ...newAttachments]);
      const successMsg = skippedFiles > 0 
        ? `Added ${newAttachments.length} file(s). ${skippedFiles} file(s) skipped due to validation errors.`
        : `Added ${newAttachments.length} file(s) to your message.`;
      addMessage({
        text: successMsg,
        sender: 'bot'
      });
    } else if (skippedFiles > 0) {
      addMessage({
        text: `No files were added. All ${skippedFiles} file(s) failed validation.`,
        sender: 'error'
      });
    }
  };

  if (!isOpen) {
    return (
      <button
        ref={chatButtonRef}
        onClick={openChat}
        className={cn(
          "fixed w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full shadow-lg transition-all duration-300 flex items-center justify-center hover:scale-110 hover:shadow-xl",
          className
        )}
        style={{
          zIndex: 9999,
          bottom: '24px',
          right: '24px',
          position: 'fixed'
        }}
        aria-label="Open EduLearn Assistant"
      >
        <MessageCircle size={28} />
      </button>
    );
  }

  return (
    <div
      ref={chatWidgetRef}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "fixed bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col chatbot-slide-in relative transition-all duration-300",
        isFullScreen
          ? "inset-4 w-auto h-auto rounded-xl"
          : "w-96 h-[550px]",
        isDragOver && "border-blue-500 border-2 bg-blue-50/50",
        className
      )}
      style={{
        zIndex: 9999,
        bottom: isFullScreen ? '16px' : '24px',
        right: isFullScreen ? '16px' : '24px',
        left: isFullScreen ? '16px' : 'auto',
        top: isFullScreen ? '16px' : 'auto',
        position: 'fixed'
      }}
    >
      {/* Drag Overlay */}
      {isDragOver && (
        <div className="absolute inset-0 bg-blue-500/10 border-2 border-dashed border-blue-500 rounded-xl flex items-center justify-center z-10 backdrop-blur-sm">
          <div className="text-center p-4">
            <div className="text-blue-600 text-lg font-semibold mb-2">Drop files here</div>
            <div className="text-blue-500 text-sm">PDF, Word, Excel, PowerPoint, Text, or Images</div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-xl">
        <div className="flex items-center space-x-2">
          {showHistory ? (
            <button
              onClick={() => setShowHistory(false)}
              className="hover:bg-white/20 p-1 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          ) : (
            <button
              onClick={toggleHistory}
              className="hover:bg-white/20 p-1 rounded-full transition-colors"
              title="Chat History"
            >
              <History size={20} />
            </button>
          )}
          <h3 className="font-semibold">EduLearn Assistant</h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={startNewChat}
            className="text-white hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-white/20"
            title="New Chat"
          >
            <Plus size={18} />
          </button>
          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="text-white hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-white/20"
            aria-label={isFullScreen ? "Exit full screen" : "Full screen"}
          >
            {isFullScreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
          {user?.role === 'admin' && (
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="text-white hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-white/20"
              aria-label="Settings"
            >
              <Settings size={18} />
            </button>
          )}
          <button
            onClick={() => setIsOpen(false)}
            className="text-white hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-white/20"
            aria-label="Close chat"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && user?.role === 'admin' && (
        <div className="bg-gray-100 p-4 border-b border-gray-200 space-y-3 animate-in slide-in-from-top-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Role Override</label>
            <select
              value={debugRole}
              onChange={(e) => setDebugRole(e.target.value)}
              className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Learning Style Override</label>
            <select
              value={debugStyle}
              onChange={(e) => setDebugStyle(e.target.value)}
              className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="General">General</option>
              <option value="ADHD">ADHD</option>
              <option value="Dyslexia">Dyslexia</option>
              <option value="Anxiety">Anxiety</option>
            </select>
          </div>
        </div>
      )}

      {/* History Sidebar */}
      {showHistory && (
        <div className="absolute inset-0 top-[60px] bg-white z-20 flex flex-col animate-in slide-in-from-left-2">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="font-semibold text-gray-700">Chat History</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {isLoadingHistory ? (
              <div className="flex justify-center p-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : chatHistory.length === 0 ? (
              <div className="text-center text-gray-500 p-4 text-sm">No previous chats found</div>
            ) : (
              chatHistory.map((session) => (
                <div
                  key={session.id}
                  className={cn(
                    "w-full flex items-center justify-between p-3 rounded-lg text-sm transition-colors hover:bg-gray-100 cursor-pointer group",
                    sessionId === session.session_token ? "bg-blue-50 border border-blue-200" : "border border-transparent"
                  )}
                  onClick={() => loadSession(session.session_token)}
                >
                  <div className="flex-1 min-w-0 mr-2">
                    <div className="font-medium text-gray-800 truncate">
                      {session.summary || new Date(session.started_at).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(session.last_activity).toLocaleString()}
                    </div>
                  </div>
                  <button
                    onClick={(e) => deleteSession(session.session_token, e)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                    title="Delete Chat"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message) => (
          <div key={message.id} className="chatbot-message-in">
            <div
              className={cn(
                "flex",
                message.sender === 'user' ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] p-3 rounded-2xl break-words",
                  message.sender === 'user'
                    ? "bg-blue-500 text-white rounded-br-md"
                    : message.sender === 'error'
                      ? "bg-red-50 text-red-800 border border-red-200 rounded-bl-md"
                      : "bg-white text-gray-800 border border-gray-300 rounded-bl-md shadow-sm"
                )}
              >
                {message.isTyping ? (
                  <div className="flex space-x-1 py-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                ) : (
                  <div>

                    <div className={cn(
                      "text-sm leading-relaxed overflow-wrap-anywhere",
                      message.sender === 'bot' ? "markdown-content" : "whitespace-pre-wrap"
                    )}>
                      {message.sender === 'bot' ? (
                        <ReactMarkdown
                          remarkPlugins={remarkGfmPlugin ? [remarkGfmPlugin] : []}
                          components={{
                            p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                            ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
                            ol: ({ node, ...props }) => <ol className="list-decimal pl-4 mb-2 space-y-1" {...props} />,
                            li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                            h1: ({ node, ...props }) => <h1 className="text-lg font-bold mb-2" {...props} />,
                            h2: ({ node, ...props }) => <h2 className="text-base font-bold mb-2" {...props} />,
                            h3: ({ node, ...props }) => <h3 className="text-sm font-bold mb-1" {...props} />,
                            code: ({ node, className, children, ...props }: any) => {
                              const match = /language-(\w+)/.exec(className || '')
                              return !match ? (
                                <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono text-pink-600" {...props}>
                                  {children}
                                </code>
                              ) : (
                                <div className="relative group my-2">
                                  <div className="absolute top-0 right-0 bg-gray-800 text-xs text-gray-400 px-2 py-1 rounded-bl-md rounded-tr-md">
                                    {match[1]}
                                  </div>
                                  <pre className="bg-gray-900 text-gray-100 p-3 rounded-md overflow-x-auto text-xs">
                                    <code className={className} {...props}>
                                      {children}
                                    </code>
                                  </pre>
                                </div>
                              )
                            },
                            blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-gray-300 pl-3 italic text-gray-600 my-2" {...props} />,
                            a: ({ node, ...props }) => <a className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                            table: ({ node, ...props }) => <div className="overflow-x-auto my-2"><table className="min-w-full divide-y divide-gray-200 border" {...props} /></div>,
                            th: ({ node, ...props }) => <th className="px-3 py-2 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b" {...props} />,
                            td: ({ node, ...props }) => <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 border-b" {...props} />,
                          }}
                        >
                          {message.text}
                        </ReactMarkdown>
                      ) : (
                        message.text
                      )}
                    </div>
                    {/* Display attachments */}
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {message.attachments.map((attachment, index) => (
                          <div key={index} className="flex items-center space-x-2 p-2 bg-gray-100 rounded-lg">
                            <FileText size={16} className="text-gray-500" />
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-medium text-gray-700 truncate">{attachment.name}</div>
                              <div className="text-xs text-gray-500">{formatFileSize(attachment.size)}</div>
                            </div>
                            {attachment.url && (
                              <a
                                href={attachment.url}
                                download={attachment.name}
                                className="p-1 text-blue-500 hover:text-blue-700"
                              >
                                <Download size={14} />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Quick replies */}
            {message.quickReplies && message.quickReplies.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3 chatbot-fade-in">
                {message.quickReplies.map((reply, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickReply(reply.text)}
                    className="px-4 py-2 text-sm bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-all duration-200 border border-blue-300 hover:shadow-sm font-medium"
                    disabled={isLoading}
                  >
                    {reply.text}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 bg-white rounded-b-xl">
        <form onSubmit={handleSubmit} className="flex items-end space-x-3">
          {/* Attach Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100 transition"
            disabled={isLoading || !isAuthenticated}
            title="Attach files"
          >
            <Paperclip size={20} />
          </button>
          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.jpg,.jpeg,.png,.webp"
            onChange={handleFileUpload}
            className="hidden"
          />
          {/* Mic Button */}
          {isClient && (
            <button
              type="button"
              onClick={handleSpeechToggle}
              className={cn(
                "p-2 rounded-full transition",
                isListening || isRecording
                  ? "text-red-600 bg-red-100"
                  : "text-gray-500 hover:text-blue-600 hover:bg-gray-100",
                !isSpeechSupported && "opacity-50 cursor-not-allowed"
              )}
              disabled={isLoading || !isAuthenticated || !isSpeechSupported}
              title={
                isListening || isRecording ? "Stop voice input" : "Start voice input"
              }
            >
              {isListening || isRecording ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
          )}
          {/* Expanding Textarea */}
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={e => {
              setInputValue(e.target.value);
              resizeTextarea(e.target);
            }}
            onInput={e => resizeTextarea(e.target as HTMLTextAreaElement)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder={isLoading ? "Thinking..." : "Type your message..."}
            className="flex-1 max-h-32 min-h-[40px] p-2 bg-gray-100 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all resize-none text-sm"
            disabled={isLoading || !isAuthenticated}
            rows={1}
          />
          {/* Send Button */}
          <button
            type="submit"
            className={cn(
              "p-2 rounded-full transition-all duration-200 flex-shrink-0",
              inputValue.trim() || attachments.length > 0
                ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:scale-105"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            )}
            disabled={(!inputValue.trim() && attachments.length === 0) || isLoading || !isAuthenticated}
            title="Send message"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}