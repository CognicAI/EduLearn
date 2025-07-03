'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Paperclip, FileText, Download } from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { cn } from '@/lib/utils';

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

interface ChatbotWidgetProps {
  className?: string;
}

export function ChatbotWidget({ className }: ChatbotWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatWidgetRef = useRef<HTMLDivElement>(null);
  const chatButtonRef = useRef<HTMLButtonElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, isAuthenticated, getAccessToken } = useAuth();

  // Generate session ID on mount
  useEffect(() => {
    if (isAuthenticated && user) {
      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setSessionId(newSessionId);
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
        welcomeMessage: `Hello ${user.firstName}! I'm EduLearn SQL Assistant. As an admin, you have full access to query the database. You can write SQL queries in plain text and I'll format and execute them for you.`,
        quickReplies: [
          { text: "Show all users" },
          { text: "Show user statistics" },
          { text: "List all courses" },
          { text: "Show system analytics" },
          { text: "Database schema help" }
        ]
      },
      teacher: {
        welcomeMessage: `Hello ${user.firstName}! I'm EduLearn SQL Assistant. As a teacher, you can query data related to your courses and students. You can write SQL queries in plain text and I'll format and execute them for you.`,
        quickReplies: [
          { text: "Show my courses" },
          { text: "Show my students" },
          { text: "Course enrollment stats" },
          { text: "Assignment submissions" },
          { text: "Help with SQL" }
        ]
      },
      student: {
        welcomeMessage: `Hello ${user.firstName}! I'm EduLearn SQL Assistant. As a student, you can query data related to your courses and progress. You can write SQL queries in plain text and I'll format and execute them for you.`,
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
      welcomeMessage: "Hello! I'm EduLearn SQL Assistant. You can write SQL queries in plain text and I'll format and execute them for you.",
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

    // Check if user is asking about or mentioning the attached files
    const isFileRelated = text.trim() && attachments.length > 0 && (
      text.toLowerCase().includes('file') ||
      text.toLowerCase().includes('document') ||
      text.toLowerCase().includes('pdf') ||
      text.toLowerCase().includes('attached') ||
      text.toLowerCase().includes('upload') ||
      text.toLowerCase().includes('analyze') ||
      text.toLowerCase().includes('read') ||
      text.toLowerCase().includes('review') ||
      text.toLowerCase().includes('select') ||
      text.toLowerCase().includes('look at') ||
      text.toLowerCase().includes('examine') ||
      text.toLowerCase().includes('content') ||
      text.toLowerCase().includes('what') ||
      text.toLowerCase().includes('tell me') ||
      text.toLowerCase().includes('explain') ||
      text.toLowerCase().includes('summarize') ||
      text.toLowerCase().includes('this') ||
      text.toLowerCase().includes('these') ||
      attachments.some(att => text.toLowerCase().includes(att.name.toLowerCase().split('.')[0]))
    );

    // Prepare message with attachments only if file-related
    const messageAttachments = isFileRelated ? attachments.map(att => ({
      name: att.name,
      size: att.size,
      type: att.type,
      base64: att.base64
    })) : [];

    // Add user message
    addMessage({ 
      text: text || (attachments.length > 0 ? `Sent ${attachments.length} file(s)` : ''), 
      sender: 'user',
      attachments: messageAttachments.length > 0 ? messageAttachments : undefined
    });

    // Only clear attachments if they were sent with the message
    if (isFileRelated) {
      setAttachments([]);
    }

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

      const payload = {
        query: text,
        attachments: messageAttachments,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        },
        sessionId: sessionId,
        timestamp: new Date().toISOString()
      };

      // Use the backend API instead of direct webhook call
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      
      if (!apiUrl) {
        throw new Error('API URL not configured. Please check your environment variables.');
      }

      const response = await fetch(`${apiUrl}/chatbot/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-User-Role': user.role,
          'X-User-ID': user.id
        },
        body: JSON.stringify(payload)
      });

      // Remove typing indicator
      setMessages(prev => prev.filter(msg => !msg.isTyping));

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error('Authentication failed. Please log in again.');
        }
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const responseData = await response.json();
      
      if (!responseData.success) {
        throw new Error(responseData.message || 'Chatbot request failed');
      }
      
      const data = responseData.data;
      
      // Get role-specific quick replies
      const defaultQuickReplies = getRoleSpecificContent().quickReplies;
      const quickReplies = data.quick_replies || defaultQuickReplies;

      // Handle different response formats from webhook
      let botResponse;
      if (Array.isArray(data) && data.every(item => typeof item.text === 'string')) {
        // Handle array response format
        const combinedText = data.map(item => item.text).join('\n\n');
        botResponse = combinedText;
      } else {
        botResponse = data.response || data.message || "I received your message! How else can I help you?";
      }

      addMessage({
        text: botResponse,
        sender: 'bot',
        quickReplies: quickReplies
      });

    } catch (error) {
      // Remove typing indicator
      setMessages(prev => prev.filter(msg => !msg.isTyping));
      
      console.error('Chatbot error:', error);
      const errorMessage = error instanceof Error 
        ? error.message.includes('Authentication failed')
          ? 'Your session has expired. Please refresh the page and log in again.'
          : `Error: ${error.message}`
        : 'An unexpected error occurred. Please try again.';
      
      addMessage({
        text: errorMessage,
        sender: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickReply = (replyText: string) => {
    sendMessage(replyText);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      sendMessage(inputValue);
      setInputValue('');
    } else if (!inputValue.trim() && attachments.length > 0) {
      // If only files are attached without text, prompt user to ask about them
      addMessage({
        text: "I see you've attached files. Please ask me something about them (e.g., 'analyze this document', 'what's in this file?', 'summarize this') to proceed.",
        sender: 'bot'
      });
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
      'text/csv'
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

  const processFiles = async (files: File[]) => {
    const newAttachments: Array<{
      name: string;
      size: number;
      type: string;
      file: File;
      base64: string;
    }> = [];
    
    for (const file of files) {
      // Validate file type
      if (!isValidFileType(file)) {
        addMessage({
          text: `File "${file.name}" is not supported. Please upload PDF, Word, Excel, PowerPoint, or text files.`,
          sender: 'error'
        });
        continue;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        addMessage({
          text: `File "${file.name}" is too large. Maximum file size is 10MB.`,
          sender: 'error'
        });
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
      }
    }

    if (newAttachments.length > 0) {
      setAttachments(prev => [...prev, ...newAttachments]);
      addMessage({
        text: `Added ${newAttachments.length} file(s) to your message.`,
        sender: 'bot'
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
        "fixed w-96 h-[550px] bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col chatbot-slide-in relative",
        isDragOver && "border-blue-500 border-2 bg-blue-50/50",
        className
      )}
      style={{ 
        zIndex: 9999,
        bottom: '24px',
        right: '24px',
        position: 'fixed'
      }}
    >
      {/* Drag Overlay */}
      {isDragOver && (
        <div className="absolute inset-0 bg-blue-500/10 border-2 border-dashed border-blue-500 rounded-xl flex items-center justify-center z-10 backdrop-blur-sm">
          <div className="text-center p-4">
            <div className="text-blue-600 text-lg font-semibold mb-2">Drop files here</div>
            <div className="text-blue-500 text-sm">PDF, Word, Excel, PowerPoint, or text files</div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-xl">
        <div className="flex items-center space-x-2">
          <MessageCircle size={20} />
          <h3 className="font-semibold">EduLearn Assistant</h3>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-white hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-white/20"
          aria-label="Close chat"
        >
          <X size={20} />
        </button>
      </div>

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
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                ) : (
                  <div>
                    <div className="whitespace-pre-wrap text-sm leading-relaxed break-words overflow-wrap-anywhere">{message.text}</div>
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

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-white rounded-b-xl">
        {/* Attachment Preview */}
        {attachments.length > 0 && (
          <div className="mb-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500 font-medium">Attachments ({attachments.length})</div>
              <div className="text-xs text-blue-500 font-medium">Ask me about these files to include them</div>
            </div>
            <div className="space-y-2 max-h-24 overflow-y-auto">
              {attachments.map((attachment, index) => (
                <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg border">
                  <FileText size={16} className="text-blue-500" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-gray-700 truncate">{attachment.name}</div>
                    <div className="text-xs text-gray-500">{formatFileSize(attachment.size)}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAttachment(index)}
                    className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="relative flex items-center">
          {/* File Upload Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute left-3 p-2 text-gray-500 hover:text-blue-600 transition-colors rounded-full hover:bg-blue-50"
            disabled={isLoading || !isAuthenticated}
          >
            <Paperclip size={16} />
          </button>
          
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={isDragOver ? "Drop files here or type your message..." : "Type your message..."}
            className={cn(
              "w-full pl-12 pr-20 py-3 border-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm bg-white",
              isDragOver ? "border-blue-500 bg-blue-50/50" : "border-gray-300"
            )}
            disabled={isLoading || !isAuthenticated}
          />
          
          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
            onChange={handleFileUpload}
            className="hidden"
          />
          
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim() || !isAuthenticated}
            className="absolute right-2 px-3 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center font-medium border-2 border-blue-600 hover:border-blue-700 space-x-1"
          >
            <Send size={14} />
            <span className="text-xs">Send</span>
          </button>
        </div>
      </form>
    </div>
  );
}