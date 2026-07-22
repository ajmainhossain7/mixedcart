import React, { useState, useEffect, useRef, useContext } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from '../context/AuthContext';
import '../styles/chat.css';
import { API_URL, SOCKET_URL } from '../api';

const ChatWidget = () => {
    const { user } = useContext(AuthContext);
    const [isOpen, setIsOpen] = useState(false);
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessageText, setNewMessageText] = useState('');

    const socketRef = useRef(null);
    const messagesEndRef = useRef(null);

    // Initialize socket connection when user logs in
    useEffect(() => {
        if (!user) {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
            // Reset state
            setConversations([]);
            setActiveConversation(null);
            setMessages([]);
            return;
        }

        socketRef.current = io(SOCKET_URL);

        socketRef.current.on('connect', () => {
            console.log('Socket client connected:', socketRef.current.id);
        });

        // Listen for incoming messages
        socketRef.current.on('receive_message', (message) => {
            // Append message if it belongs to the active conversation
            setMessages((prevMessages) => {
                if (prevMessages.some(m => m._id === message._id)) return prevMessages;
                if (activeConversation && message.conversation === activeConversation._id) {
                    return [...prevMessages, message];
                }
                return prevMessages;
            });

            // Update conversation list item lastMessage
            setConversations((prevConvs) => {
                return prevConvs.map(conv => {
                    if (conv._id === message.conversation) {
                        return {
                            ...conv,
                            lastMessage: message.text,
                            lastMessageAt: message.createdAt
                        };
                    }
                    return conv;
                }).sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
            });
        });

        // Load active conversations list
        fetchConversations();

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, activeConversation]);

    // Scroll to bottom of message list whenever messages update
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    // Listen for custom event to open chat with a seller from product page
    useEffect(() => {
        const handleOpenChat = async (e) => {
            const { sellerId } = e.detail;
            if (!user) {
                setIsOpen(true);
                return;
            }

            try {
                // Initialize/Fetch conversation
                const res = await fetch(`${API_URL}/api/chat/conversation`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.token}`
                    },
                    body: JSON.stringify({ sellerId })
                });

                if (res.ok) {
                    const data = await res.json();
                    setActiveConversation(data.conversation);
                    setIsOpen(true);

                    // Fetch messages for this conversation
                    fetchMessages(data.conversation._id);

                    // Join Socket Room
                    if (socketRef.current) {
                        socketRef.current.emit('join_room', data.conversation._id);
                    }

                    // Reload conversation list
                    fetchConversations();
                }
            } catch (err) {
                console.error('Failed to open chat with seller:', err);
            }
        };

        window.addEventListener('open_chat_with_seller', handleOpenChat);
        return () => window.removeEventListener('open_chat_with_seller', handleOpenChat);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const fetchConversations = async () => {
        if (!user) return;
        try {
            const res = await fetch(`${API_URL}/api/chat/conversations`, {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            if (res.ok) {
                const data = await res.json();
                // Filter conversations so that customers only see conversations in their widget
                // (Sellers will manage chats in their dedicated tab, but can see them here too)
                setConversations(data);
            }
        } catch (err) {
            console.error('Failed to fetch conversations:', err);
        }
    };

    const fetchMessages = async (conversationId) => {
        if (!user) return;
        try {
            const res = await fetch(`${API_URL}/api/chat/messages/${conversationId}`, {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
            }
        } catch (err) {
            console.error('Failed to fetch messages:', err);
        }
    };

    const handleSelectConversation = (conv) => {
        setActiveConversation(conv);
        fetchMessages(conv._id);

        if (socketRef.current) {
            socketRef.current.emit('join_room', conv._id);
        }
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessageText.trim() || !activeConversation || !socketRef.current) return;

        const payload = {
            conversationId: activeConversation._id,
            senderId: user._id,
            text: newMessageText
        };

        // Send to socket
        socketRef.current.emit('send_message', payload);
        setNewMessageText('');
    };

    const getParticipantName = (conv) => {
        if (!conv) return '';
        // If current user is the customer, show seller name (or company name if available)
        if (user._id === conv.customer._id) {
            return conv.companyProfile ? conv.companyProfile.companyName : conv.seller.name;
        }
        // If current user is the seller, show customer name
        return conv.customer.name;
    };

    const getParticipantLogo = (conv) => {
        if (!conv) return null;
        if (user._id === conv.customer._id && conv.companyProfile && conv.companyProfile.logoUrl) {
            return conv.companyProfile.logoUrl;
        }
        return null;
    };

    // Render Widget Toggle Bubble
    const renderToggleBtn = () => (
        <button className="chat-widget-toggle-btn" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle chat">
            {isOpen ? (
                <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
            ) : (
                <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.084.29.128.597.128.916 0 3.737-3.722 6.75-8.318 6.75-1.077 0-2.119-.166-3.084-.469l-3.327 2.018c-.43.26-.99-.071-.99-.575v-1.748c-1.39-1.282-2.288-3.003-2.288-4.912 0-3.737 3.722-6.75 8.318-6.75 4.596 0 8.318 3.013 8.318 6.75zm-8.25-.975v.008H12v-.008zm-3 0v.008h.008v-.008zm6 0v.008h.008v-.008z" />
                </svg>
            )}
        </button>
    );

    return (
        <div className="chat-widget-container">
            {renderToggleBtn()}

            <div className={`chat-window-box ${isOpen ? '' : 'closed'}`}>
                {/* Header */}
                <div className="chat-window-header">
                    <div className="chat-header-info">
                        {activeConversation ? (
                            <>
                                <button className="chat-close-btn" onClick={() => setActiveConversation(null)} aria-label="Back">
                                    ←
                                </button>
                                {getParticipantLogo(activeConversation) ? (
                                    <img src={getParticipantLogo(activeConversation)} alt="Logo" className="chat-header-logo" />
                                ) : (
                                    <div className="chat-header-avatar-fallback">
                                        {getParticipantName(activeConversation).charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div className="chat-header-details">
                                    <span className="chat-header-name">{getParticipantName(activeConversation)}</span>
                                    <span className="chat-header-status">
                                        <span className="status-dot"></span>
                                        Online
                                    </span>
                                </div>
                            </>
                        ) : (
                            <div className="chat-header-details">
                                <span className="chat-header-name" style={{ fontSize: '15px', fontFamily: 'var(--font-serif)', letterSpacing: '0.05em' }}>MixedCart Chat</span>
                                <span className="chat-header-status" style={{ fontSize: '10px' }}>Talk with lifestyle curators</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Content Area */}
                {!user ? (
                    <div className="chat-prompt-box">
                        <h3 className="chat-prompt-title">Sign In Required</h3>
                        <p className="chat-prompt-desc">You must be logged in to chat with company sellers and ask questions about pieces.</p>
                        <a href="/login" onClick={() => setIsOpen(false)} className="btn-primary" style={{ fontSize: '12px', padding: '10px 20px' }}>
                            Go to Login
                        </a>
                    </div>
                ) : activeConversation ? (
                    /* Messages Room */
                    <>
                        <div className="chat-messages-pane">
                            {messages.length === 0 ? (
                                <p style={{ color: 'var(--text-light)', fontSize: '12px', fontStyle: 'italic', textAlign: 'center', marginTop: '20px' }}>
                                    No messages yet. Send a message to start conversing!
                                </p>
                            ) : (
                                messages.map((msg) => (
                                    <div key={msg._id} className={`chat-message-item ${msg.sender === user._id ? 'sent' : 'received'}`}>
                                        {msg.text}
                                        <span className="chat-message-timestamp">
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                        
                        <form onSubmit={handleSendMessage} className="chat-input-bar">
                            <input
                                type="text"
                                className="chat-input-field"
                                placeholder="Type a message..."
                                value={newMessageText}
                                onChange={(e) => setNewMessageText(e.target.value)}
                            />
                            <button type="submit" className="chat-send-btn" disabled={!newMessageText.trim()}>
                                <svg fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                                </svg>
                            </button>
                        </form>
                    </>
                ) : (
                    /* Conversation List */
                    <div className="chat-conversations-list">
                        {conversations.length === 0 ? (
                            <div className="chat-prompt-box">
                                <p className="chat-prompt-desc" style={{ fontStyle: 'italic' }}>
                                    No active chats. Start a conversation by clicking "Chat with Seller" on any product details page.
                                </p>
                            </div>
                        ) : (
                            conversations.map((conv) => (
                                <div key={conv._id} className="chat-conv-item" onClick={() => handleSelectConversation(conv)}>
                                    {getParticipantLogo(conv) ? (
                                        <img src={getParticipantLogo(conv)} alt="Logo" className="chat-header-logo" style={{ alignSelf: 'flex-start', marginTop: '2px' }} />
                                    ) : (
                                        <div className="chat-header-avatar-fallback" style={{ alignSelf: 'flex-start', width: '36px', height: '36px' }}>
                                            {getParticipantName(conv).charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div className="chat-conv-details">
                                        <div className="chat-conv-name-row">
                                            <span className="chat-conv-name">{getParticipantName(conv)}</span>
                                            <span className="chat-conv-time">
                                                {new Date(conv.lastMessageAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                        <span className="chat-conv-msg">
                                            {conv.lastMessage || 'No messages yet'}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatWidget;
