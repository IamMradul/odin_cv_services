import React, { useState, useRef, useEffect } from 'react';
import { Send, BrainCircuit, Loader, ChevronDown, ChevronUp } from 'lucide-react';
import '../styles/intelligence.css';

// Basic markdown parser for LLM responses
const formatMessage = (text) => {
  if (!text) return { __html: '' };
  let html = text;
  
  // Replace code blocks
  html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
  // Replace bold
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  // Replace line breaks with paragraphs
  const paragraphs = html.split('\n\n').filter(p => p.trim() !== '');
  html = paragraphs.map(p => {
    // If it's a pre tag, don't wrap in p
    if (p.startsWith('<pre>')) return p;
    // Replace single line breaks with <br/>
    const withBr = p.replace(/\n/g, '<br/>');
    return `<p>${withBr}</p>`;
  }).join('');
  
  return { __html: html };
};

const Intelligence = () => {
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Hello! I\'m the Odin-CV analytics assistant. I can help you analyze the surveillance logs. What would you like to know?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (text) => {
    const query = text || inputValue.trim();
    if (!query) return;

    // Add user message
    const userMsg = { role: 'user', content: query };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:7860/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: query })
      });

      if (!res.ok) throw new Error('Failed to fetch from LLM backend');
      
      const data = await res.json();
      
      setMessages(prev => [...prev, {
        role: 'ai',
        content: data.answer,
        context_used: data.context_used
      }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        role: 'ai',
        content: 'Error: Could not connect to the inference engine. Make sure the intelligence backend is running on port 7860.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleContext = (index) => {
    setMessages(prev => {
      const newMsgs = [...prev];
      newMsgs[index] = { ...newMsgs[index], showContext: !newMsgs[index].showContext };
      return newMsgs;
    });
  };

  const chips = [
    "How many unidentified faces were detected overall?",
    "Were there any armed person alerts today?",
    "Which object stayed for the longest duration?",
    "Give me a breakdown of events by camera"
  ];

  return (
    <div className="intelligence-container">
      <div className="intelligence-header">
        <h1 className="intelligence-title">Odin-CV Intelligence</h1>
        <p className="intelligence-subtitle">Ask questions about surveillance logs, alerts, and system events using natural language.</p>
      </div>

      <div className="intelligence-chips">
        {chips.map((chip, idx) => (
          <div key={idx} className="intelligence-chip" onClick={() => handleSend(chip)}>
            {chip}
          </div>
        ))}
      </div>

      <div className="chat-box">
        <div className="chat-messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message ${msg.role}`}>
              {msg.role === 'ai' ? (
                <>
                  <div dangerouslySetInnerHTML={formatMessage(msg.content)} />
                  {msg.context_used && (
                    <>
                      <div className="context-toggle" onClick={() => toggleContext(idx)}>
                        {msg.showContext ? <ChevronUp size={14} style={{display:'inline', verticalAlign:'middle'}}/> : <ChevronDown size={14} style={{display:'inline', verticalAlign:'middle'}}/>}
                        <span style={{marginLeft: 4, verticalAlign:'middle'}}>{msg.showContext ? 'Hide Analytics Data Used' : 'View Analytics Data Used'}</span>
                      </div>
                      {msg.showContext && (
                        <div className="context-data">
                          {msg.context_used}
                        </div>
                      )}
                    </>
                  )}
                </>
              ) : (
                msg.content
              )}
            </div>
          ))}
          {isLoading && (
            <div className="chat-loading">
              <div className="chat-spinner"></div> Processing logs...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-area">
          <div className="chat-input-wrapper">
            <input
              type="text"
              className="chat-input"
              placeholder="Ask about the logs..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />
            <button 
              className="chat-send-btn" 
              onClick={() => handleSend()} 
              disabled={isLoading || !inputValue.trim()}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Intelligence;
