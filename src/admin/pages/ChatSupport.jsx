import React, { useState, useEffect } from 'react';
import { Search, Download, MessageSquare, Send, User, MoreVertical, CheckCircle2, Clock, CheckCircle, RefreshCcw, ArrowLeft } from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import clsx from 'clsx';
import { gatewayClient } from '../../api/gatewayClient';

export default function ChatSupport() {
  const [chats, setChats] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchChats = async () => {
    try {
      setLoading(true);
      const res = await gatewayClient.getAdminChatInbox();
      
      const allMessages = res.data?.data || res.data || [];
      
      if (!Array.isArray(allMessages)) {
        console.error("Invalid messages format", allMessages);
        setChats([]);
        return;
      }

      // Group messages by user (either sender or receiver depending on who the admin is talking to)
      const groupedChats = {};
      
      allMessages.forEach(msg => {
        const isFromAdmin = msg.sender_type === 'admin';
        const userId = isFromAdmin ? msg.receiver_id : msg.sender_id;
        const userType = isFromAdmin ? msg.receiver_type : msg.sender_type;

        if (!groupedChats[userId]) {
          groupedChats[userId] = {
            id: userId,
            user: `${userType.charAt(0).toUpperCase() + userType.slice(1)} (${userId.substring(0, 6)})`,
            userType: userType,
            status: 'active',
            lastMessage: '',
            time: '',
            lastMessageDate: null,
            unread: 0,
            messages: []
          };
        }
        
        groupedChats[userId].messages.push({
          id: msg.id,
          sender: isFromAdmin ? 'admin' : 'user',
          text: msg.message,
          time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          dateObj: new Date(msg.created_at)
        });

        if (!isFromAdmin && !msg.is_read) {
          groupedChats[userId].unread += 1;
        }
      });

      // Process grouped chats
      const formattedChats = Object.values(groupedChats).map(chat => {
        // Sort messages by time
        chat.messages.sort((a, b) => a.dateObj - b.dateObj);
        
        if (chat.messages.length > 0) {
          const lastMsg = chat.messages[chat.messages.length - 1];
          chat.lastMessage = lastMsg.text;
          chat.time = lastMsg.time;
          chat.lastMessageDate = lastMsg.dateObj;
          
          if (chat.unread > 0) {
            chat.status = 'new';
          } else if (lastMsg.sender === 'admin') {
            chat.status = 'resolved'; // Just a simplistic state mapping for demo
          }
        }
        return chat;
      });

      // Sort by newest first
      formattedChats.sort((a, b) => {
        if (a.unread > 0 && b.unread === 0) return -1;
        if (a.unread === 0 && b.unread > 0) return 1;
        return b.lastMessageDate - a.lastMessageDate;
      });

      setChats(formattedChats);
    } catch (err) {
      console.error("Failed to load chats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();
    
    // Connect to WebSocket for real-time messages
    const token = localStorage.getItem('merchant_token') || localStorage.getItem('admin_token');
    if (!token) return;

    const apiUrl = import.meta.env.VITE_API_URL || '';
    let wsUrl = apiUrl.replace(/^http/, 'ws');
    if (wsUrl.endsWith('/api/v1')) {
      wsUrl = wsUrl.replace('/api/v1', '');
    }
    
    if (wsUrl === '') {
       // fallback for local testing if env is completely empty
       wsUrl = 'ws://localhost:8080';
    }

    const socket = new WebSocket(`${wsUrl}/ws?token=${token}`);

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'new_chat_message') {
          // Instead of manually mutating the complex grouped state, 
          // the simplest robust way to ensure perfect sync is to re-fetch the inbox
          // or if the chat is open, re-fetch that chat.
          fetchChats();
          
          // Note: Since we re-fetch the inbox, we might also want to fetch the active chat
          // again if it's currently selected to get the full updated history immediately.
        }
      } catch (err) {
        console.error("Error parsing WS message:", err);
      }
    };

    return () => {
      socket.close();
    };
  }, []);

  // Sync selected chat when full fetch happens
  useEffect(() => {
    if (selectedChatId) {
      // Re-fetch the specific chat history to ensure the right panel is also perfectly up to date
      gatewayClient.getAdminChatHistory(selectedChatId).then(res => {
        const history = res.data?.data || res.data || [];
        if (Array.isArray(history)) {
          const fullMessages = history.map(msg => ({
            id: msg.id,
            sender: msg.sender_type === 'admin' ? 'admin' : 'user',
            text: msg.message,
            time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            dateObj: new Date(msg.created_at)
          })).sort((a, b) => a.dateObj - b.dateObj);
          
          setChats(prev => prev.map(c => 
            c.id === selectedChatId 
              ? { ...c, messages: fullMessages } 
              : c
          ));
        }
      }).catch(console.error);
    }
  }, [chats.length]); // Rough trigger on chat updates

  const selectedChat = chats.find(c => c.id === selectedChatId);

  // Sorting: 'new' first, then 'active', then 'resolved'
  const statusOrder = { new: 0, active: 1, resolved: 2 };
  const filteredAndSortedChats = chats
    .filter(chat => chat.user.toLowerCase().includes(searchQuery.toLowerCase()) || chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);

  const handleExportPDF = () => {
    if (!selectedChat) {
      alert("Please select a chat to export its history.");
      return;
    }

    const doc = new jsPDF();
    doc.text(`Chat History Report - ${selectedChat.user}`, 14, 15);
    
    const tableColumn = ["Who Sent Message", "Message", "Time", "Date"];
    const tableRows = [];

    selectedChat.messages.forEach(msg => {
      const rowData = [
        msg.sender === 'admin' ? 'Admin' : 'User',
        msg.text,
        msg.time,
        msg.dateObj.toLocaleDateString()
      ];
      tableRows.push(rowData);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [41, 128, 185] },
      columnStyles: { 1: { cellWidth: 100 } }
    });

    doc.save(`chat_history_${selectedChat.id}.pdf`);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChatId) return;

    try {
      await gatewayClient.sendAdminChatMessage(selectedChatId, selectedChat.userType || 'merchant', newMessage);
      setNewMessage('');
      
      // The WebSocket will receive the 'new_chat_message' event and automatically refresh the UI.
      // But for snappiness, we can optionally fetch it here too or let the WS handle it.
      
    } catch (err) {
      console.error("Failed to send message", err);
      alert("Failed to send message. Please try again.");
    }
  };

  const handleMarkResolved = () => {
    if (!selectedChatId) return;
    const updatedChats = chats.map(chat => {
      if (chat.id === selectedChatId) {
        return { ...chat, status: 'resolved' };
      }
      return chat;
    });
    setChats(updatedChats);
  };

  const handleSelectChat = async (chat) => {
    setSelectedChatId(chat.id);
    
    // Fetch full chat history for this user
    try {
      const res = await gatewayClient.getAdminChatHistory(chat.id);
      const history = res.data?.data || res.data || [];
      
      if (Array.isArray(history)) {
        const fullMessages = history.map(msg => ({
          id: msg.id,
          sender: msg.sender_type === 'admin' ? 'admin' : 'user',
          text: msg.message,
          time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          dateObj: new Date(msg.created_at)
        })).sort((a, b) => a.dateObj - b.dateObj);
        
        setChats(prev => prev.map(c => 
          c.id === chat.id 
            ? { ...c, messages: fullMessages, unread: 0, status: 'active' } 
            : c
        ));
      }
    } catch (err) {
      console.error("Failed to fetch full history:", err);
      // Fallback to optimistic unread clear
      setChats(prev => prev.map(c => c.id === chat.id ? { ...c, unread: 0, status: 'active' } : c));
    }
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col p-2 space-y-4">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-admin-on-surface">Chat Support</h2>
        <div className="flex items-center space-x-3">
          <button 
            onClick={fetchChats}
            className="flex items-center justify-center p-2 text-admin-on-surface-variant hover:text-admin-on-surface hover:bg-admin-surface-container-high rounded-lg transition-colors"
            title="Refresh Chats"
          >
            <RefreshCcw size={20} className={loading ? "animate-spin" : ""} />
          </button>
          <button 
            onClick={handleExportPDF}
            className="flex items-center space-x-2 bg-admin-surface-container-high hover:bg-admin-surface-container-highest text-admin-on-surface px-4 py-2 rounded-lg border border-admin-outline-variant transition-colors"
          >
            <Download size={18} />
            <span>Export History to PDF</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-4 overflow-hidden">
        
        {/* Left Sidebar - Chat List (Table Style) */}
        <div className="w-1/3 min-w-[350px] max-w-[400px] flex flex-col bg-admin-surface-container rounded-xl border border-admin-outline-variant overflow-hidden">
          <div className="p-4 border-b border-admin-outline-variant">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-on-surface-variant" size={18} />
              <input
                type="text"
                placeholder="Search chats by user..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-admin-surface-container-high border border-admin-outline-variant text-admin-on-surface rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-admin-primary/50"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-admin-surface-container-high sticky top-0 z-10 text-xs text-admin-on-surface-variant border-b border-admin-outline-variant">
                <tr>
                  <th className="font-semibold p-3 w-1/2">User</th>
                  <th className="font-semibold p-3">Status</th>
                  <th className="font-semibold p-3 text-right">Time</th>
                </tr>
              </thead>
              <tbody>
                {loading && chats.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="p-8 text-center text-admin-on-surface-variant">Loading chats...</td>
                  </tr>
                ) : filteredAndSortedChats.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="p-8 text-center text-admin-on-surface-variant">No chats found.</td>
                  </tr>
                ) : (
                  filteredAndSortedChats.map((chat) => (
                    <tr 
                      key={chat.id}
                      onClick={() => handleSelectChat(chat)}
                      className={clsx(
                        "border-b border-admin-outline-variant cursor-pointer transition-colors hover:bg-admin-surface-container-high",
                        selectedChatId === chat.id && "bg-admin-surface-container-highest",
                        chat.status === 'new' && "border-l-4 border-l-admin-primary"
                      )}
                    >
                      <td className="p-3 align-top">
                        <div className={clsx("font-semibold text-sm", chat.status === 'new' ? "text-admin-primary" : "text-admin-on-surface")}>
                          {chat.userType || 'User'}
                        </div>
                        <div className="text-[10px] text-admin-on-surface-variant font-mono mt-0.5" title={chat.id}>
                          {chat.id.substring(0, 8)}...
                        </div>
                        <p className={clsx("text-xs mt-1 max-w-[120px] truncate", chat.status === 'new' ? "text-admin-on-surface font-medium" : "text-admin-on-surface-variant")}>
                          {chat.lastMessage}
                        </p>
                      </td>
                      <td className="p-3 align-top">
                        {chat.status === 'new' && (
                          <span className="bg-admin-primary/20 text-admin-primary text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0">
                            New
                          </span>
                        )}
                        {chat.status === 'active' && (
                          <span className="bg-green-500/20 text-green-500 text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0">
                            Active
                          </span>
                        )}
                        {chat.status === 'resolved' && (
                          <CheckCircle2 size={14} className="text-green-500 shrink-0" />
                        )}
                      </td>
                      <td className="p-3 align-top text-right text-xs text-admin-on-surface-variant whitespace-nowrap">
                        {chat.time}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Panel - Chat Interface */}
        <div className="flex-1 flex flex-col bg-admin-surface-container rounded-xl border border-admin-outline-variant overflow-hidden">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-admin-outline-variant flex justify-between items-center bg-admin-surface-container-high">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-admin-primary/20 flex items-center justify-center text-admin-primary">
                    <User size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-admin-on-surface">{selectedChat.user}</h3>
                    <div className="flex items-center text-xs text-admin-on-surface-variant space-x-2">
                      <span className={clsx(
                        "w-2 h-2 rounded-full",
                        selectedChat.status === 'active' ? "bg-green-500" : 
                        selectedChat.status === 'new' ? "bg-admin-primary" : "bg-gray-500"
                      )} />
                      <span className="capitalize">{selectedChat.status}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {selectedChat.status !== 'resolved' && (
                    <button 
                      onClick={handleMarkResolved}
                      className="flex items-center space-x-1 px-3 py-1.5 bg-green-500/10 text-green-500 hover:bg-green-500/20 rounded-lg text-sm font-medium transition-colors"
                    >
                      <CheckCircle size={16} />
                      <span>Mark Resolved</span>
                    </button>
                  )}
                  <button className="p-2 text-admin-on-surface-variant hover:text-admin-on-surface hover:bg-admin-surface-container-highest rounded-lg transition-colors">
                    <MoreVertical size={20} />
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedChat.messages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={clsx(
                      "flex flex-col max-w-[70%]",
                      msg.sender === 'admin' ? "ml-auto items-end" : "mr-auto items-start"
                    )}
                  >
                    <div 
                      className={clsx(
                        "px-4 py-2 rounded-2xl",
                        msg.sender === 'admin' 
                          ? "bg-admin-primary text-admin-on-primary rounded-tr-sm" 
                          : "bg-admin-surface-container-high text-admin-on-surface border border-admin-outline-variant rounded-tl-sm"
                      )}
                    >
                      {msg.text}
                    </div>
                    <span className="text-xs text-admin-on-surface-variant mt-1">{msg.time}</span>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-admin-outline-variant bg-admin-surface-container-high">
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={selectedChat.status === 'resolved' ? "Chat is resolved. You can still send a message..." : "Type your message..."}
                    className="flex-1 bg-admin-surface-container border border-admin-outline-variant text-admin-on-surface rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-admin-primary/50"
                  />
                  <button 
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="bg-admin-primary hover:bg-admin-primary/90 disabled:opacity-50 disabled:hover:bg-admin-primary text-admin-on-primary p-3 rounded-xl transition-colors flex items-center justify-center w-12"
                  >
                    <Send size={20} />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-admin-on-surface-variant">
              <MessageSquare size={48} className="mb-4 opacity-50" />
              <p className="text-lg font-medium">Select a chat to view</p>
              <p className="text-sm">Choose from the list on the left to start responding live.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}