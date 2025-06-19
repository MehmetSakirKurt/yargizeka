import React, { useState, useRef, useEffect } from 'react'
import { MessageSquare, Send, User, Bot, Loader, Trash2 } from 'lucide-react'
import { sendChatMessage } from '../lib/n8nClient'
import { supabase } from '../lib/supabaseClient'
import { useAppStore, ChatMessage } from '../lib/store'

const HukukAsistani: React.FC = () => {
  const { user, chatMessages, addChatMessage, clearChatMessages } = useAppStore()
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatMessages])

  useEffect(() => {
    // Başlangıç mesajı ekle
    if (chatMessages.length === 0) {
      addChatMessage({
        id: '1',
        content: 'Merhaba! Ben YargıZeka Hukuk Asistanınızım. Size hukuki konularda yardımcı olmak için buradayım. Emsal kararlar, kanun maddeleri ve hukuki prosedürler hakkında sorularınızı sorabilirsiniz.',
        sender: 'assistant',
        timestamp: new Date()
      })
    }
  }, [])

  const handleSendMessage = async () => {
    if (!message.trim() || loading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: message.trim(),
      sender: 'user',
      timestamp: new Date()
    }

    addChatMessage(userMessage)
    setMessage('')
    setLoading(true)
    setError(null)

    try {
      const response = await sendChatMessage(userMessage.content)
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response,
        sender: 'assistant',
        timestamp: new Date()
      }

      addChatMessage(assistantMessage)

      // Kullanım logunu kaydet
      await supabase
        .from('yargizeka.usage_logs')
        .insert({
          user_id: user?.user_id,
          action_type: 'chat_message',
          tokens_used: Math.ceil((userMessage.content.length + response.length) / 4),
          metadata: { question_length: userMessage.content.length }
        })

    } catch (error: any) {
      console.error('Sohbet hatası:', error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: 'Üzgünüm, şu anda yanıt veremiyorum. Lütfen daha sonra tekrar deneyin.',
        sender: 'assistant',
        timestamp: new Date()
      }
      addChatMessage(errorMessage)
      setError('Mesaj gönderilemedi')
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleClearChat = () => {
    if (window.confirm('Tüm sohbet geçmişi silinecek. Emin misiniz?')) {
      clearChatMessages()
    }
  }

  const quickQuestions = [
    'Tazminat davası nasıl açılır?',
    'Boşanma sürecinde hangi belgeler gerekli?',
    'İcra takibine nasıl itiraz edilir?',
    'Kira artış oranları nedir?',
    'İş kazası tazminatı nasıl hesaplanır?'
  ]

  const handleQuickQuestion = (question: string) => {
    setMessage(question)
    inputRef.current?.focus()
  }

  return (
    <div className="hukuk-asistani">
      <div className="page-header">
        <div className="page-title-section">
          <MessageSquare className="page-icon" size={32} />
          <div>
            <h1 className="page-title">Hukuk Asistanı</h1>
            <p className="page-subtitle">AI destekli hukuki danışmanlık</p>
          </div>
        </div>
        <button onClick={handleClearChat} className="clear-chat-btn" title="Sohbeti Temizle">
          <Trash2 size={18} />
        </button>
      </div>

      <div className="chat-container">
        <div className="chat-messages">
          {chatMessages.map((msg) => (
            <div key={msg.id} className={`message ${msg.sender}`}>
              <div className="message-avatar">
                {msg.sender === 'user' ? (
                  <User size={20} />
                ) : (
                  <Bot size={20} />
                )}
              </div>
              <div className="message-content">
                <div className="message-text">{msg.content}</div>
                <div className="message-time">
                  {msg.timestamp.toLocaleTimeString('tr-TR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="message assistant">
              <div className="message-avatar">
                <Bot size={20} />
              </div>
              <div className="message-content">
                <div className="typing-indicator">
                  <Loader className="spin" size={16} />
                  <span>Yanıt hazırlanıyor...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {chatMessages.length <= 1 && (
          <div className="quick-questions">
            <h3 className="quick-questions-title">Hızlı Sorular</h3>
            <div className="quick-questions-grid">
              {quickQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickQuestion(question)}
                  className="quick-question-btn"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="chat-input-container">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <div className="chat-input">
            <input
              ref={inputRef}
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Hukuki sorunuzu yazın..."
              disabled={loading}
              className="message-input"
            />
            <button
              onClick={handleSendMessage}
              disabled={!message.trim() || loading}
              className="send-btn"
            >
              <Send size={18} />
            </button>
          </div>
          
          <div className="input-help">
            <p>💡 İpucu: Spesifik sorular sorun, emsal kararlar ve kanun maddeleri hakkında bilgi alın.</p>
          </div>
        </div>
      </div>
      
      <div className="chat-info">
        <div className="info-cards">
          <div className="info-card">
            <h4>Emsal Kararlar</h4>
            <p>Yargıtay ve Danıştay kararlarına dayalı yanıtlar alın</p>
          </div>
          <div className="info-card">
            <h4>Güncel Mevzuat</h4>
            <p>En son kanun ve yönetmelik değişikliklerinden haberdar olun</p>
          </div>
          <div className="info-card">
            <h4>Prosedür Rehberi</h4>
            <p>Hukuki süreçler için adım adım rehberlik alın</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HukukAsistani