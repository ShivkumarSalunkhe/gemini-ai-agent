import { useState, useRef, useEffect } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { motion, AnimatePresence } from 'framer-motion';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import { UserCircleIcon } from '@heroicons/react/24/solid';
import ReactMarkdown from 'react-markdown';

const TypingIndicator = () => (
  <div className="flex items-center space-x-2 px-4 py-2">
    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
  </div>
);

export const Chat = () => {
  const [input, setInput] = useState('');
  const [inputPosition, setInputPosition] = useState('center'); // 'center' or 'bottom'
  const messagesEndRef = useRef(null);
  const { sendMessage, messages, isConnected, error, isLoading } = useWebSocket('ws://localhost:8000/ws');

  // Update input position when first message is sent
  useEffect(() => {
    if (messages.length > 0 && inputPosition === 'center') {
      setInputPosition('bottom');
    }
  }, [messages.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && isConnected) {
      sendMessage(input.trim());
      setInput('');
    }
  };

  const renderMessage = (message) => {
    
    const isUser = message.type === 'query';
    
    return (
      <div className={`flex items-start space-x-2 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
        {/* Avatar */}
        {isUser ? (
          <UserCircleIcon className="h-8 w-8 text-primary" />
        ) : (
          <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
            AI
          </div>
        )}
        
        {/* Message Content */}
        <div className={`flex-1 max-w-[80%] ${isUser ? 'text-right' : ''}`}>
          <div
            className={`inline-block rounded-lg px-4 py-2 ${
              isUser
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted'
            }`}
          >
            {isUser ? (
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <div className="markdown-content">
                  <ReactMarkdown
                    components={{
                      table: ({ node, ...props }) => (
                        <div className="table-container border border-border rounded-lg overflow-hidden my-4">
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-border" {...props} />
                          </div>
                        </div>
                      ),
                      thead: ({ node, ...props }) => (
                        <thead className="bg-muted/50" {...props} />
                      ),
                      th: ({ node, ...props }) => (
                        <th 
                          className="px-6 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider border-b border-border"
                          {...props} 
                        />
                      ),
                      td: ({ node, ...props }) => (
                        <td 
                          className="px-6 py-4 text-sm text-foreground whitespace-nowrap border-b border-border/50"
                          {...props}
                        />
                      ),
                      tr: ({ node, isHeader, ...props }) => (
                        <tr 
                          className="hover:bg-muted/30 transition-colors"
                          {...props}
                        />
                      ),
                      p: ({ node, ...props }) => (
                        <p className="my-2" {...props} />
                      ),
                      h2: ({ node, ...props }) => (
                        <h2 className="text-xl font-semibold mt-6 mb-4" {...props} />
                      ),
                      h3: ({ node, ...props }) => (
                        <h3 className="text-lg font-semibold mt-4 mb-2" {...props} />
                      ),
                      h4: ({ node, ...props }) => (
                        <h4 className="text-base font-semibold mt-3 mb-2" {...props} />
                      ),
                      ul: ({ node, ...props }) => (
                        <ul className="list-disc list-inside my-2" {...props} />
                      ),
                      ol: ({ node, ...props }) => (
                        <ol className="list-decimal list-inside my-2" {...props} />
                      ),
                      li: ({ node, ...props }) => (
                        <li className="my-1" {...props} />
                      ),
                      blockquote: ({ node, ...props }) => (
                        <blockquote 
                          className="border-l-4 border-primary pl-4 my-4 italic text-muted-foreground"
                          {...props}
                        />
                      ),
                    }}
                  >
                    {typeof message.content === 'string' ? message.content : JSON.stringify(message.content)}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {isUser ? 'You' : 'Assistant'} • {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Connection status */}
      {/* Connection status - New modern design */}
      <div className="border-b border-border mb-4 pb-2">
        <div className="max-w-screen-xl mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div
                className={`h-2.5 w-2.5 rounded-full ${
                  isConnected ? 'bg-green-500' : 'bg-red-500'
                }`}
              />
              <div
                className={`absolute -inset-1 rounded-full ${
                  isConnected ? 'bg-green-500' : 'bg-red-500'
                } animate-ping opacity-20`}
              />
            </div>
            <span className={`text-sm font-medium ${
              isConnected ? 'text-green-500' : 'text-red-500'
            }`}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          {error && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2 px-3 py-1 bg-destructive/10 text-destructive rounded-full text-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Messages container with dynamic padding */}
      <div className={`flex-1 relative ${messages.length === 0 ? 'pb-[40vh]' : 'pb-20'} transition-all duration-300`}>
        <div className="h-full overflow-y-auto">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <svg 
                  className="w-10 h-10 text-primary"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-foreground">
                  Welcome to Document Chat
                </h3>
                <p className="text-muted-foreground mt-2 max-w-sm">
                  Upload your documents and start asking questions about them. 
                  I'm here to help you analyze and understand your documents.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6 p-4">
              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    {renderMessage(message)}
                  </motion.div>
                ))}
                
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex items-start space-x-2"
                  >
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                      AI
                    </div>
                    <div className="flex-1 max-w-[80%]">
                      <div className="inline-block rounded-lg bg-muted">
                        <TypingIndicator />
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Assistant is typing...
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Chat input with dynamic positioning */}
      <motion.div
        initial={false}
        animate={{
          y: inputPosition === 'center' ? '-40vh' : 0,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`
          ${inputPosition === 'center' 
            ? 'relative w-full max-w-2xl mx-auto px-4'
            : 'fixed bottom-0 right-0 left-[280px] w-auto px-4 md:left-300px]'
          }
          ${messages.length > 0 ? 'bg-background/80 backdrop-blur-lg border-t border-border' : ''}
          pb-6 pt-4
        `}
      >
        <form 
          onSubmit={handleSubmit}
          className="flex items-center gap-2 bg-card border border-border rounded-xl p-2 shadow-lg"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none"
            disabled={!isConnected}
          />
          <button
            type="submit"
            disabled={!isConnected || !input.trim()}
            className="inline-flex items-center justify-center rounded-lg p-2 text-primary hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </form>
      </motion.div>
    </div>
  );
}; 