import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Chatbot = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [chats, setChats] = useState([]); 
  const [activeChat, setActiveChat] = useState(null); 
  const [loading, setLoading] = useState(false);


useEffect(() => {
  const loadChatHistory = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    try {
      const res = await fetch(`http://localhost:3000/api/chathistory/${userId}`);
      const data = await res.json();

      if (data.chats) {
        const formattedChats = data.chats.map(chat => ({
          id: chat.sessionId,
          messages: chat.messages || []
        }));
        setChats(formattedChats);
        setActiveChat(formattedChats[0]?.id || null);
      }
    } catch (err) {
      console.error(err);
    }
  };
  loadChatHistory();
}, []);

const createNewChat = async () => {
  try {
    const userId = localStorage.getItem("userId");
    const res = await fetch(`http://localhost:3000/api/chathistory/new/${userId}`, {
      method: "POST",
    });
    const newChat = await res.json();

    setChats(prev => [...prev, { id: newChat.sessionId, messages: [] }]);
    setActiveChat(newChat.sessionId);
  } catch (err) {
    console.error(err);
  }
};

const sendinput = async (text) => {
  if (!text.trim() || !activeChat) return;

  const newMessage = {
    id: Date.now(),
    text,
    sender: "user",
    time: new Date().toISOString()
  };

  setChats(prev =>
    prev.map(chat =>
      chat.id === activeChat
        ? { ...chat, messages: [...chat.messages, newMessage] }
        : chat
    )
  );
  setInputValue("");

  const loadingMessage = {
    id: Date.now() + 1,
    text: "LOADING...",
    sender: "bot",
    time: new Date().toISOString()
  };

  setChats(prev =>
    prev.map(chat =>
      chat.id === activeChat
        ? { ...chat, messages: [...chat.messages, loadingMessage] }
        : chat
    )
  );

  try {
    const response = await fetch("http://localhost:3000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text })
    });
    const data = await response.json();

    setChats(prev =>
      prev.map(chat =>
        chat.id === activeChat
          ? {
              ...chat,
              messages: chat.messages.map(msg =>
                msg.text === "LOADING..." ? { ...msg, text: data.reply } : msg
              )
            }
          : chat
      )
    );

    await fetch(`http://localhost:3000/api/chathistory/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: localStorage.getItem("userId"),
        sessionId: activeChat,
        messages: [newMessage, { text: data.reply, sender: "bot", time: new Date().toISOString() }]
      })
    });

  } catch (err) {
    console.error(err);
    setChats(prev =>
      prev.map(chat =>
        chat.id === activeChat
          ? {
              ...chat,
              messages: chat.messages.map(msg =>
                msg.text === "LOADING..." ? { ...msg, text: "Error: could not get reply" } : msg
              )
            }
          : chat
      )
    );
  }
};


const deletechat = async (chatId) => {
  try {
    const userId = localStorage.getItem("userId");
    await fetch(`http://localhost:3000/api/chathistory/${userId}/${chatId}`, {
      method: "DELETE",
    });
    setChats(prev => prev.filter(c => c.id !== chatId));

    if (activeChat === chatId) setActiveChat(null);
  } catch (err) {
    console.error(err);
  }
};

  const getChatTitle = (chat) => {
    const firstUserMsg = chat.messages.find((m) => m.sender === "user");
    return firstUserMsg ? firstUserMsg.text.slice(0, 20) : "New Chat";
  };

  const activeMessages =
    chats.find((c) => c.id === activeChat)?.messages || [];


    

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <div
        className={`fixed md:static inset-y-0 left-0 z-50 w-80 bg-white border-r border-gray-200 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-200 ease-in-out`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-200">
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden absolute top-5 right-6 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
            <button
              onClick={createNewChat}
              className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition duration-200"
            >
              + New Chat
            </button>
          </div>

          {/* Chat List */}
         <div className="flex-1 overflow-y-auto p-4 space-y-2">
  {chats.map((chat) => (
    <div
      key={chat.id}
      className="flex justify-between items-center bg-gray-50 hover:bg-gray-100 rounded-md transition px-2"
    >
      {/* Chat title */}
      <button
        onClick={() => setActiveChat(chat.id)}
        className={`flex-1 text-left px-4 py-2 rounded-md transition ${
          activeChat === chat.id
            ? "bg-grey-100 text-blue-600 font-medium"
            : ""
        }`}
      >
        {getChatTitle(chat)}
      </button>

      {/* Delete button */}
      <button
        onClick={(e) => {
          e.stopPropagation(); 
          deletechat(chat.id);
        }}
        className="ml-2 px-2 py-1 text-xs font-bold text-white bg-red-400 hover:bg-red-600 rounded-md transition"
      >
        ✕
      </button>
    </div>
  ))}
</div>


          <div className="p-4 border-t border-gray-200">
            <Link
              to="/"
              className="text-indigo-600 hover:text-indigo-500 text-sm font-medium transition duration-200 block text-center"
              onClick={() => setSidebarOpen(false)}
            >
              Logout
            </Link>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden text-gray-500 hover:text-gray-700 p-2 rounded-md hover:bg-gray-100"
          >
            ☰
          </button>
          <h1 className="text-xl font-semibold text-gray-900">AI Chatbot</h1>
        </header>

        <main className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50">
          {activeMessages.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                <span className="text-3xl">🤖</span>
              </div>
              <h2 className="text-lg font-medium text-gray-900 mb-2">
                Welcome to ChatBot
              </h2>
              <p className="text-gray-500 mb-4">
                Start typing to begin a new conversation.
              </p>
            </div>
          ) : (
            activeMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-2xl px-4 py-2 ${
                    msg.sender === "user"
                      ? "bg-blue-500 text-white rounded-lg rounded-br-md shadow-sm"
                      : "bg-white text-gray-900 rounded-lg rounded-bl-md shadow-sm border border-gray-200"
                  }`}
                >
                  <p className="text-base whitespace-pre-line">{msg.text}</p>
                  <p
                    className={`text-xs mt-2 ${
                      msg.sender === "user" ? "text-blue-100" : "text-gray-500"
                    }`}
                  >
                    {new Date(msg.time).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
        </main>

        {/* Input */}
        {activeChat && (
          <div className="bg-white border-t border-gray-200 p-4">
            <div className="max-w-4xl mx-auto flex items-end space-x-2">
              <textarea
                placeholder="Send a message..."
                rows={1}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendinput(inputValue);
                  }
                }}
                className="flex-1 resize-none px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 min-h-[44px] max-h-48 overflow-y-auto"
                onInput={(e) => {
                  e.target.style.height = "auto";
                  e.target.style.height = e.target.scrollHeight + "px";
                }}
              />
              <button
                className="p-3 bg-blue-500 w-20 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 shadow-sm flex items-center justify-center"
                onClick={() => sendinput(inputValue)}
              >
                ➤
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chatbot;
