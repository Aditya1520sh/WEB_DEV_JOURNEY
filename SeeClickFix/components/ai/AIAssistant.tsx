'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSession } from 'next-auth/react'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
}

export function AIAssistant() {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  // Example questions based on role
  const exampleQuestions = session?.user.role === 'admin' 
    ? [
        "Estimate cost for repairing a 3-foot pothole",
        "Which department handles street light issues?",
        "What priority for major water leak?"
      ]
    : [
        "How do I report a pothole?",
        "What info needed for street light report?",
        "How long to fix garbage collection?"
      ]

  const handleExampleClick = (question: string) => {
    setInput(question)
  }

  useEffect(() => {
    // Initialize with welcome message and examples
    if (messages.length === 0) {
      const welcomeContent = session?.user.role === 'admin' 
        ? `Hello! I'm your AI assistant for civic issue management.

I can help you with:
• Estimating repair costs and timelines
• Suggesting appropriate departments
• Setting priority levels
• Resource allocation planning

⚠️ Note: I ONLY help with civic infrastructure issues. I cannot assist with general questions, coding, homework, or other topics.`
        : `Hi! I'm your AI assistant for civic issue reporting.

I can help you with:
• Writing clear issue reports
• Understanding the reporting process
• Categorizing civic problems
• Taking effective photos
• Estimating resolution times

⚠️ Note: I ONLY help with civic issues like potholes, street lights, garbage, etc. I cannot assist with general questions, coding, homework, or other topics.`

      const welcomeMessage: Message = {
        id: 'welcome',
        content: welcomeContent,
        role: 'assistant',
        timestamp: new Date()
      }
      
      setMessages([welcomeMessage])
    }
  }, [session, messages.length])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      role: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input.trim(),
          role: session?.user.role || 'user',
          context: messages.slice(-5) // Last 5 messages for context
        })
      })

      if (response.ok) {
        const data = await response.json()
        
        // Handle blocked responses
        if (data.blocked) {
          const blockedMessage: Message = {
            id: Date.now().toString() + '_blocked',
            content: data.answer,
            role: 'assistant',
            timestamp: new Date()
          }
          setMessages(prev => [...prev, blockedMessage])
        } else {
          const assistantMessage: Message = {
            id: Date.now().toString() + '_ai',
            content: data.answer || 'I apologize, but I encountered an issue. Please ask about civic issues like potholes, street lights, or garbage collection.',
            role: 'assistant',
            timestamp: new Date()
          }
          setMessages(prev => [...prev, assistantMessage])
        }
      } else if (response.status === 429) {
        const rateLimitMessage: Message = {
          id: Date.now().toString() + '_ratelimit',
          content: '⏱️ You have reached the hourly limit (20 questions). Please try again in an hour.',
          role: 'assistant',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, rateLimitMessage])
      } else if (response.status === 503) {
        const configMessage: Message = {
          id: Date.now().toString() + '_config',
          content: '⚠️ AI Assistant is not configured. Please contact the administrator.',
          role: 'assistant',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, configMessage])
      } else {
        throw new Error('Failed to get response')
      }
    } catch (error) {
      console.error('AI Assistant error:', error)
      
      const errorMessage: Message = {
        id: Date.now().toString() + '_error',
        content: 'I apologize, but I encountered an error. Please try again later or contact support if the problem persists.',
        role: 'assistant',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <>
      {/* Chat Toggle Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 260, damping: 20 }}
      >
        <Button
          onClick={() => setIsOpen(true)}
          className={`relative h-14 w-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 ${
            isOpen ? 'hidden' : 'flex'
          } items-center justify-center pulse-glow`}
        >
          <MessageCircle className="h-6 w-6" />
          
          {/* Notification Dot */}
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center">
            <span className="h-2 w-2 bg-white rounded-full animate-pulse"></span>
          </span>
        </Button>
      </motion.div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: 20, y: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 20, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-6 right-6 z-50 w-96 h-[500px] glass-card backdrop-blur-xl bg-white/95 dark:bg-black/95 border border-white/20 dark:border-white/10 rounded-2xl shadow-2xl flex flex-col"
          >
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/20 dark:border-white/10">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white">
                    AI Assistant
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {session?.user.role === 'admin' ? 'Admin Support' : 'Citizen Support'}
                  </p>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 dark:hover:bg-black/20"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Example Questions (show only when no user messages) */}
              {messages.filter(m => m.role === 'user').length === 0 && !isLoading && (
                <div className="space-y-2 mb-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Try asking:</p>
                  {exampleQuestions.map((question, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleExampleClick(question)}
                      className="block w-full text-left px-3 py-2 text-xs bg-white/30 dark:bg-black/30 hover:bg-white/50 dark:hover:bg-black/50 border border-white/20 dark:border-white/10 rounded-lg transition-colors text-gray-700 dark:text-gray-300"
                    >
                      💡 {question}
                    </button>
                  ))}
                </div>
              )}

              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-start space-x-3 ${
                    message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}
                >
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    message.role === 'user' 
                      ? 'bg-gradient-to-r from-green-500 to-blue-500' 
                      : 'bg-gradient-to-r from-blue-600 to-purple-600'
                  }`}>
                    {message.role === 'user' ? (
                      <User className="h-4 w-4 text-white" />
                    ) : (
                      <Bot className="h-4 w-4 text-white" />
                    )}
                  </div>
                  
                  <div className={`flex-1 ${message.role === 'user' ? 'text-right' : ''}`}>
                    <div className={`inline-block p-3 rounded-2xl max-w-[280px] ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white'
                        : 'bg-white/50 dark:bg-black/50 text-gray-800 dark:text-white border border-white/20 dark:border-white/10'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start space-x-3"
                >
                  <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-white/50 dark:bg-black/50 border border-white/20 dark:border-white/10 p-3 rounded-2xl">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        Thinking...
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Auto-scroll anchor */}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={sendMessage} className="p-4 border-t border-white/20 dark:border-white/10">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about civic issues only..."
                  disabled={isLoading}
                  maxLength={1000}
                  className="flex-1 px-4 py-2 bg-white/50 dark:bg-black/50 border border-white/20 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm"
                />
                <Button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  size="icon"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}