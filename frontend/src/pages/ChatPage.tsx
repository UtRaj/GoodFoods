import { useState, useRef, useEffect } from 'react';
import { Send, Trash, Star, MapPin, Pizza, Coffee, Smile, RefreshCw } from 'lucide-react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { ChatMessage } from '../types';
import { Header } from '../components/Header';
import { useAuth } from '../context/AuthContext';

const api = axios.create({
  baseURL: import.meta.env.VITE_CHAT_URL, 
  timeout: 20000,
});

export function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const { user } = useAuth();
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    let storedSessionId = localStorage.getItem("sessionId");
    if (!storedSessionId) {
      fetchMessages("new");
    } else {
      fetchMessages(storedSessionId);
    }
  }, []);

  const fetchMessages = async (sid: string) => {
    try {
      const response = await api.get(`/conversation/${sid}`);
      if (!response.data || !response.data.history) throw new Error("Invalid response structure");
      setMessages(response.data.history);
      setSessionId(response.data.session_id);
      if (sid === "new") localStorage.setItem("sessionId", response.data.session_id);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleDeleteSession = async () => {
    if (!sessionId) return;
    try {
      await api.delete(`/session/${sessionId}`);
      setSessionId(null);
      localStorage.removeItem("sessionId");
      fetchMessages("new");
    } catch (error) {
      console.error('Error clearing session:', error);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

  let currentSessionId = sessionId;
  if (!currentSessionId) {
    // Create a new session synchronously
    const response = await fetchMessages("new");
    currentSessionId = response?.session_id;
    if (!currentSessionId) return;
  }

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setTimedOut(false);

    try {
      const response = await api.post('/chat/', {
        message: input,
        session_id: sessionId,
        user_id: user?.user_id,
      });

      if (response.data.detail === "Invalid session ID") {
        alert("Invalid session ID, starting a new session");
        fetchMessages("new");
        return;
      }

      setMessages(prev => [...prev, { role: 'assistant', content: response.data.response }]);
    } catch (error: any) {
      console.error('Error sending message:', error);
      const isTimeoutError =
        error.code === 'ECONNABORTED' || (error.message && error.message.includes('timeout'));
      if (isTimeoutError) {
        setTimedOut(true);
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content:
              "⏳ Response is delayed but your message was sent successfully. Click refresh to check again.",
          },
        ]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: "⚠️ Sorry, an error occurred." }]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckResponse = async () => {
    if (!sessionId || !timedOut) return;
    setIsLoading(true);
    try {
      const response = await api.get(`/conversation/${sessionId}`);
      if (!response.data || !response.data.history) throw new Error("Invalid response structure");
      setMessages(response.data.history);
      setTimedOut(false);
    } catch (error) {
      console.error('Error checking for response:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: any) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const funSuggestions = [
  { 
    text: 'I want to try Italian restaurants in Bangalore!!', 
    icon: <Pizza className="w-4 h-4 text-white" />, 
    bg: 'bg-gradient-to-r from-green-400 to-green-600', 
    hover: 'hover:from-green-500 hover:to-green-700' 
  },
  { 
    text: 'Best romantic date spots in Bangalore?', 
    icon: <Star className="w-4 h-4 text-white" />, 
    bg: 'bg-gradient-to-r from-pink-400 to-pink-600', 
    hover: 'hover:from-pink-500 hover:to-pink-700' 
  },
  { 
    text: 'Recommend best Chinese food places near Bangalore?', 
    icon: <Coffee className="w-4 h-4 text-white" />, 
    bg: 'bg-gradient-to-r from-yellow-400 to-yellow-600', 
    hover: 'hover:from-yellow-500 hover:to-yellow-700' 
  },
  { 
    text: 'Hidden Continental cuisine gems in Bangalore?', 
    icon: <MapPin className="w-4 h-4 text-white" />, 
    bg: 'bg-gradient-to-r from-purple-400 to-purple-600', 
    hover: 'hover:from-purple-500 hover:to-purple-700' 
  },
  { 
    text: 'Where to take a big family in Bangalore?', 
    icon: <Smile className="w-4 h-4 text-white" />, 
    bg: 'bg-gradient-to-r from-teal-400 to-teal-600', 
    hover: 'hover:from-teal-500 hover:to-teal-700' 
  },
];


  const FormattedMessage = ({ content, isUser }: { content: string, isUser: boolean }) => (
    <div className={`prose prose-sm ${isUser ? 'text-white' : 'text-gray-800'}`}>
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col">
      <Header />
      <div className="max-w-4xl mx-auto w-full p-6 flex-1 flex flex-col">
        
        {/* Suggestions */}
        
        <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar mb-2">
          {funSuggestions.map((s) => (
          <button
              key={s.text}
              onClick={() => setInput(s.text)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-white bg-opacity-70 backdrop-brightness-90 hover:backdrop-brightness-105 transition-all duration-200
                ${s.bg} ${s.hover}`}
                >
                 {s.icon}
                <span>{s.text}</span>
                </button>

          ))}
          </div>



        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 rounded-2xl p-6 bg-white/60 backdrop-blur-md shadow-inner border border-gray-100">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] px-4 py-3 rounded-2xl shadow-sm transition-all ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white'
                    : 'bg-white border border-gray-200 text-gray-800'
                }`}
              >
                <FormattedMessage content={msg.content} isUser={msg.role === 'user'} />
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white/80 px-4 py-3 rounded-xl shadow-sm flex space-x-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          )}

          {timedOut && !isLoading && (
            <div className="flex justify-center my-2">
              <button
                onClick={handleCheckResponse}
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Check for response</span>
              </button>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="mt-4 bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-gray-100">
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask anything about restaurants, cuisines, or reservations..."
              rows={1}
              className="flex-1 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
            />
            <div className="flex flex-col gap-2">
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className={`px-4 py-3 rounded-xl backdrop-blur-lg border transition-all
                    ${isLoading || !input.trim()
                      ? "bg-white/20 border-white/10 opacity-50 cursor-not-allowed"
                      : "bg-white/30 border-white/20 hover:bg-white/40 hover:shadow-xl hover:shadow-indigo-300/40"
                    }
                  `}
                >
                  <Send className="w-5 h-5 text-indigo-600" />
                </button>
              <button
                onClick={handleDeleteSession}
                disabled={isLoading}
                className="bg-gray-100 text-gray-600 rounded-xl px-4 py-3 hover:bg-gray-200 shadow-md transition-all"
              >
                <Trash className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
