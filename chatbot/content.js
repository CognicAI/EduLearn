(function () {
    let chatWidgetVisible = false;
    let apiBaseUrl = null;
    let webhookUrl = null;
    let currentSessionId = null;
    let typingIndicatorId = null;
    let currentUser = null;
    let authToken = null;
    let isAuthenticated = false;

    // Function to get authentication data from LMS
    function getAuthenticationData() {
        try {
            const accessToken = localStorage.getItem('accessToken');
            const userData = localStorage.getItem('currentUser');
            
            if (accessToken && userData) {
                authToken = accessToken;
                currentUser = JSON.parse(userData);
                isAuthenticated = true;
                console.log('User authenticated:', currentUser.email, 'Role:', currentUser.role);
                return true;
            } else {
                authToken = null;
                currentUser = null;
                isAuthenticated = false;
                console.log('User not authenticated');
                return false;
            }
        } catch (error) {
            console.error('Error getting authentication data:', error);
            authToken = null;
            currentUser = null;
            isAuthenticated = false;
            return false;
        }
    }

    // Function to check if user has permission to use chatbot
    function hasChatbotPermission() {
        if (!isAuthenticated || !currentUser) {
            return false;
        }
        
        // Define which roles can use the chatbot
        const allowedRoles = ['admin', 'teacher', 'student'];
        return allowedRoles.includes(currentUser.role);
    }

    // Function to get role-specific welcome message and quick replies
    function getRoleSpecificContent() {
        if (!currentUser) {
            return {
                welcomeMessage: "Please log in to use the EduLearn Assistant.",
                quickReplies: []
            };
        }

        const roleContent = {
            admin: {
                welcomeMessage: `Hello ${currentUser.firstName}! I'm EduLearn SQL Assistant. As an admin, you have full access to query the database. You can write SQL queries in plain text and I'll format and execute them for you.`,
                quickReplies: [
                    { text: "Show all users" },
                    { text: "Show user statistics" },
                    { text: "List all courses" },
                    { text: "Show system analytics" },
                    { text: "Database schema help" }
                ]
            },
            teacher: {
                welcomeMessage: `Hello ${currentUser.firstName}! I'm EduLearn SQL Assistant. As a teacher, you can query data related to your courses and students. You can write SQL queries in plain text and I'll format and execute them for you.`,
                quickReplies: [
                    { text: "Show my courses" },
                    { text: "Show my students" },
                    { text: "Course enrollment stats" },
                    { text: "Assignment submissions" },
                    { text: "Help with SQL" }
                ]
            },
            student: {
                welcomeMessage: `Hello ${currentUser.firstName}! I'm EduLearn SQL Assistant. As a student, you can query data related to your courses and progress. You can write SQL queries in plain text and I'll format and execute them for you.`,
                quickReplies: [
                    { text: "Show my courses" },
                    { text: "My assignments" },
                    { text: "My grades" },
                    { text: "Course schedule" },
                    { text: "Help with SQL" }
                ]
            }
        };

        return roleContent[currentUser.role] || {
            welcomeMessage: "Hello! I'm EduLearn SQL Assistant. You can write SQL queries in plain text and I'll format and execute them for you.",
            quickReplies: [{ text: "Help with SQL" }]
        };
    }

    function fullyUnescapeHtmlEntities(encodedString) {
        let previousString = '';
        let currentString = encodedString;
        let iterations = 0;
        while (previousString !== currentString && iterations < 5) {
            previousString = currentString;
            const textarea = document.createElement('textarea');
            textarea.innerHTML = currentString;
            currentString = textarea.value;
            iterations++;
        }
        return currentString;
    }

    function addMessageToChatUI(text, sender, chatMessagesElement, quickReplies = [], isIndicator = false) {
        const messageContainer = document.createElement('div');
        // Determine container class: user, bot, or error
        const containerType = sender === 'user' ? 'user' : (sender === 'error' ? 'error' : 'bot');
        messageContainer.classList.add('message-container', containerType);

        const messageDiv = document.createElement('div');
        // Apply message styling based on sender: user-message, bot-message, or error-message
        const messageClassType = sender === 'user' ? 'user-message' : (sender === 'error' ? 'error-message' : 'bot-message');
        messageDiv.classList.add('message', messageClassType);

        const messageContentDiv = document.createElement('div');
        messageContentDiv.classList.add('message-content');

        if (isIndicator) {
            // For the indicator, directly set the HTML
            messageContentDiv.innerHTML = text;
            messageContainer.classList.add('typing-indicator-message');
            typingIndicatorId = `typing-indicator-${Date.now()}`;
            messageContainer.id = typingIndicatorId;
        } else {
            // If message text contains a pre tag, render it directly
            if (text.trim().startsWith('<pre>')) {
                messageContentDiv.innerHTML = text;
            } else {
                // For regular messages, unescape and process Markdown
                const unescapedText = fullyUnescapeHtmlEntities(text);
                let htmlContent = unescapedText;
                htmlContent = htmlContent
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/__(.*?)__/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    .replace(/_(.*?)_/g, '<em>$1</em>')
                    .replace(/\\n/g, '<br>')
                    .replace(/\n/g, '<br>')
                    .replace(/\"([^\"]+)\"/g, '<mark>"$1"</mark>');
                messageContentDiv.innerHTML = htmlContent;
            }
        }

        messageDiv.appendChild(messageContentDiv);

        if (sender === 'bot' && quickReplies.length > 0 && !isIndicator) { // Also ensure not to add quick replies to indicator
            const quickRepliesContainerDiv = document.createElement('div');
            quickRepliesContainerDiv.classList.add('quick-replies-container');

            quickReplies.forEach(reply => {
                const button = document.createElement('button');
                button.classList.add('quick-reply-button');
                button.textContent = reply.text;
                button.addEventListener('click', async () => {
                    addMessageToChatUI(reply.text, 'user', chatMessagesElement);
                    quickRepliesContainerDiv.remove();
                    await sendBotRequest(reply.text, chatMessagesElement);
                });
                quickRepliesContainerDiv.appendChild(button);
            });
            messageDiv.appendChild(quickRepliesContainerDiv);
        }

        messageContainer.appendChild(messageDiv);
        chatMessagesElement.appendChild(messageContainer);
        chatMessagesElement.scrollTop = chatMessagesElement.scrollHeight;
    }

    async function sendBotRequest(messageText, chatMessagesElement) {
        const chatInput = document.getElementById('edulearn-chat-input');
        const sendButton = document.getElementById('edulearn-chat-send');

        if (!webhookUrl) {
            addMessageToChatUI("Webhook URL not configured. Please check extension settings.", "error", chatMessagesElement);
            return;
        }

        // Check authentication before sending message
        if (!getAuthenticationData()) {
            addMessageToChatUI("Please log in to use the EduLearn Assistant. You must be authenticated to access this service.", "error", chatMessagesElement);
            return;
        }

        if (!hasChatbotPermission()) {
            addMessageToChatUI("You don't have permission to use the chatbot. Please contact your administrator.", "error", chatMessagesElement);
            return;
        }

        if (chatInput) chatInput.disabled = true;
        if (sendButton) sendButton.disabled = true;

        const indicatorHtml = `<div class="typing-indicator"><span></span><span></span><span></span></div>`;
        addMessageToChatUI(indicatorHtml, "bot", chatMessagesElement, [], true);

        try {
            // Include user authentication and role information in the payload
            const payload = { 
                query: messageText,
                user: {
                    id: currentUser.id,
                    email: currentUser.email,
                    firstName: currentUser.firstName,
                    lastName: currentUser.lastName,
                    role: currentUser.role
                },
                sessionId: currentSessionId,
                timestamp: new Date().toISOString()
            };

            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                    'X-User-Role': currentUser.role,
                    'X-User-ID': currentUser.id
                },
                body: JSON.stringify(payload)
            });

            const indicatorElement = document.getElementById(typingIndicatorId);
            if (indicatorElement) {
                indicatorElement.remove();
                typingIndicatorId = null;
            }

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    throw new Error('Authentication failed. Please log in again.');
                }
                const errorText = await response.text();
                throw new Error(`Webhook error: ${response.status} ${response.statusText} - ${errorText}`);
            }

            const data = await response.json();
            
            // Get role-specific quick replies
            const defaultQuickReplies = getRoleSpecificContent().quickReplies;
            const quickReplies = data.quick_replies || defaultQuickReplies;
            
            let botResponse;
            if (Array.isArray(data) && data.every(item => typeof item.text === 'string')) {
                // Combine all text entries and render in a preformatted block
                const combinedText = data.map(item => item.text).join('\n\n');
                botResponse = `<pre>${combinedText}</pre>`;
            } else {
                botResponse = data.response || data.message || "I received your message! How else can I help you?";
            }
            addMessageToChatUI(botResponse, 'bot', chatMessagesElement, quickReplies);
        } catch (error) {
            console.error('Error sending to webhook:', error);
            const indicatorElement = document.getElementById(typingIndicatorId);
            if (indicatorElement) {
                indicatorElement.remove();
                typingIndicatorId = null;
            }
            
            // Handle authentication errors specifically
            if (error.message.includes('Authentication failed')) {
                addMessageToChatUI("Your session has expired. Please refresh the page and log in again.", 'error', chatMessagesElement);
            } else {
                addMessageToChatUI(`Error: ${error.message}`, 'error', chatMessagesElement);
            }
        } finally {
            if (chatInput) chatInput.disabled = false;
            if (sendButton) sendButton.disabled = false;
            if (chatInput) chatInput.focus();
        }
    }

    async function initializeChatSession(chatMessagesElement, chatInput, sendButton) {
        if (!webhookUrl) {
            console.error("Webhook URL not configured.");
            addMessageToChatUI("EduLearn chatbot service not configured. Please set the webhook URL in extension options and refresh.", "error", chatMessagesElement);
            if (chatInput) chatInput.disabled = true;
            if (sendButton) sendButton.disabled = true;
            return false;
        }

        try {
            if (chatInput) chatInput.disabled = true;
            if (sendButton) sendButton.disabled = true;

            // Check authentication
            if (!getAuthenticationData()) {
                addMessageToChatUI("Please log in to use the EduLearn Assistant. You must be authenticated to access this service.", "error", chatMessagesElement);
                if (chatInput) chatInput.disabled = true;
                if (sendButton) sendButton.disabled = true;
                return false;
            }

            if (!hasChatbotPermission()) {
                addMessageToChatUI("You don't have permission to use the chatbot. Please contact your administrator.", "error", chatMessagesElement);
                if (chatInput) chatInput.disabled = true;
                if (sendButton) sendButton.disabled = true;
                return false;
            }

            // Generate a session ID for this chat session
            currentSessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

            // Get role-specific welcome message and quick replies
            const roleContent = getRoleSpecificContent();
            addMessageToChatUI(roleContent.welcomeMessage, "bot", chatMessagesElement, roleContent.quickReplies);

            if (chatInput) chatInput.disabled = false;
            if (sendButton) sendButton.disabled = false;
            if (chatInput) chatInput.focus();

            return true;
        } catch (error) {
            console.error('Error initializing chat session:', error);
            addMessageToChatUI(`Error starting EduLearn chat: ${error.message}`, 'error', chatMessagesElement);
            if (chatInput) chatInput.disabled = true;
            if (sendButton) sendButton.disabled = true;
            return false;
        }
    }

    function createAndInjectUI() {
        const chatIcon = document.createElement('div');
        chatIcon.id = 'edulearn-chat-icon';
        chatIcon.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="30px" height="30px">
                <path d="M0 0h24v24H0z" fill="none"/>
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
            </svg>
        `;
        document.body.appendChild(chatIcon);

        const chatWidget = document.createElement('div');
        chatWidget.id = 'edulearn-chat-widget';
        chatWidget.innerHTML = `
            <div id="edulearn-chat-header">
                <span>EduLearn Assistant</span>
                <button id="edulearn-chat-close">X</button>
            </div>
            <div id="edulearn-chat-messages"></div>
            <div id="edulearn-chat-input-area">
                <input type="text" id="edulearn-chat-input" placeholder="Type your message..." disabled>
                <button id="edulearn-chat-send" disabled>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                    </svg>
                    Send
                </button>
            </div>
        `;
        document.body.appendChild(chatWidget);

        const chatMessages = document.getElementById('edulearn-chat-messages');
        const chatInput = document.getElementById('edulearn-chat-input');
        const sendButton = document.getElementById('edulearn-chat-send');
        const closeButton = document.getElementById('edulearn-chat-close');

        async function openChat() {
            if (!chatWidgetVisible) {
                // Always check authentication when opening chat
                if (!getAuthenticationData()) {
                    // Create a temporary modal or message for unauthenticated users
                    const authMessage = document.createElement('div');
                    authMessage.style.cssText = `
                        position: fixed;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        background: white;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                        z-index: 10001;
                        text-align: center;
                        max-width: 300px;
                    `;
                    authMessage.innerHTML = `
                        <h3>Authentication Required</h3>
                        <p>Please log in to use the EduLearn Assistant.</p>
                        <button id="close-auth-message" style="margin-top: 10px; padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">OK</button>
                    `;
                    document.body.appendChild(authMessage);
                    
                    document.getElementById('close-auth-message').addEventListener('click', () => {
                        authMessage.remove();
                    });
                    
                    // Auto-remove after 5 seconds
                    setTimeout(() => {
                        if (authMessage.parentNode) {
                            authMessage.remove();
                        }
                    }, 5000);
                    
                    return;
                }

                if (!hasChatbotPermission()) {
                    // Create a temporary modal for unauthorized users
                    const permissionMessage = document.createElement('div');
                    permissionMessage.style.cssText = `
                        position: fixed;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        background: white;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                        z-index: 10001;
                        text-align: center;
                        max-width: 300px;
                    `;
                    permissionMessage.innerHTML = `
                        <h3>Access Denied</h3>
                        <p>You don't have permission to use the chatbot. Please contact your administrator.</p>
                        <button id="close-permission-message" style="margin-top: 10px; padding: 8px 16px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;">OK</button>
                    `;
                    document.body.appendChild(permissionMessage);
                    
                    document.getElementById('close-permission-message').addEventListener('click', () => {
                        permissionMessage.remove();
                    });
                    
                    // Auto-remove after 5 seconds
                    setTimeout(() => {
                        if (permissionMessage.parentNode) {
                            permissionMessage.remove();
                        }
                    }, 5000);
                    
                    return;
                }

                chatWidgetVisible = true;
                chatWidget.style.display = 'flex';
                chatIcon.style.display = 'none';
                if (!currentSessionId) {
                    await initializeChatSession(chatMessages, chatInput, sendButton);
                } else {
                    // Re-check authentication even for existing sessions
                    if (!getAuthenticationData() || !hasChatbotPermission()) {
                        // Clear the session and re-initialize
                        currentSessionId = null;
                        chatMessages.innerHTML = '';
                        await initializeChatSession(chatMessages, chatInput, sendButton);
                    } else {
                        if (chatInput) chatInput.focus();
                    }
                }
            }
        }

        chatIcon.addEventListener('click', openChat);

        closeButton.addEventListener('click', () => {
            chatWidgetVisible = false;
            chatWidget.style.display = 'none';
            chatIcon.style.display = 'flex';
        });

        async function handleSendMessage() {
            const userMessage = chatInput.value.trim();
            if (!userMessage) return;
            addMessageToChatUI(userMessage, 'user', chatMessages);
            chatInput.value = '';
            await sendBotRequest(userMessage, chatMessages);
        }

        sendButton.addEventListener('click', handleSendMessage);
        chatInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter' && !sendButton.disabled) {
                handleSendMessage();
            }
        });

        // Auto-minimize when clicking outside chat widget or icon
        document.addEventListener('click', (e) => {
            if (chatWidgetVisible) {
                if (!chatWidget.contains(e.target) && !chatIcon.contains(e.target)) {
                    chatWidgetVisible = false;
                    chatWidget.style.display = 'none';
                    chatIcon.style.display = 'flex';
                }
            }
        });

        chrome.storage.local.get(['backendType', 'webhookUrl'], (data) => {
            const backendType = data.backendType || 'local';

            if (backendType === 'local') {
                // Dynamically determine backend origin
                const pageOrigin = window.location.origin;
                let backendOrigin;
                if (pageOrigin.includes(':3000')) {
                    backendOrigin = pageOrigin.replace(':3000', ':3001');
                } else {
                    backendOrigin = pageOrigin.replace(/:\d+$/, ':3001');
                }
                webhookUrl = `${backendOrigin}/api/chatbot/query`;
                console.log('Using local EduLearn backend:', webhookUrl);
            } else {
                if (data.webhookUrl) {
                    webhookUrl = data.webhookUrl;
                    console.log('Using external webhook:', webhookUrl);
                } else {
                    console.error('Webhook URL not found in storage.');
                    webhookUrl = 'https://harsha1234.app.n8n.cloud/webhook/user-query';
                }
            }

            if (!sessionStorage.getItem('edulearnChatbotVisited')) {
                sessionStorage.setItem('edulearnChatbotVisited', 'true');
                setTimeout(openChat, 1500);
            } else if (!chatWidgetVisible) {
                chatIcon.style.display = 'flex';
            }
        });

        chatWidget.style.display = 'none';
    }

    createAndInjectUI();
})();
