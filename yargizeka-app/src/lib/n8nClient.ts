// n8n Webhook URL'leri
const N8N_CHAT_WEBHOOK = import.meta.env.VITE_N8N_CHAT_WEBHOOK || 'http://localhost:5678/webhook/yargizeka-chat'
const N8N_PETITION_WEBHOOK = import.meta.env.VITE_N8N_PETITION_WEBHOOK || 'http://localhost:5678/webhook/yargizeka-petition'

// Chatbot yanıt tipi
export interface ChatbotResponse {
  success: boolean
  response: string
  timestamp: string
  error?: string
}

// Sohbet için n8n'e istek gönder (Gemini API ile)
export async function sendChatMessage(question: string): Promise<string> {
  try {
    console.log('📤 N8N\'e mesaj gönderiliyor:', question)
    
    const response = await fetch(N8N_CHAT_WEBHOOK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question }),
    })

    if (!response.ok) {
      throw new Error(`N8N webhook hatası: ${response.status} - ${response.statusText}`)
    }

    const data: ChatbotResponse = await response.json()
    console.log('📥 N8N yanıtı:', data)
    
    if (!data.success) {
      throw new Error(data.error || 'N8N workflow hatası')
    }

    return data.response || 'Üzgünüm, yanıt alınamadı.'
  } catch (error) {
    console.error('❌ N8N chat hatası:', error)
    
    // Fallback yanıt
    if (error instanceof Error && error.message.includes('fetch')) {
      return 'N8N bağlantı hatası. N8N çalıştığından emin olun.'
    }
    
    return 'Üzgünüm, şu anda hizmet kullanılamıyor. Lütfen daha sonra tekrar deneyin.'
  }
}

// N8N bağlantısını test et
export async function testN8NConnection(): Promise<boolean> {
  try {
    const response = await fetch(N8N_CHAT_WEBHOOK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question: 'test' }),
    })
    
    return response.ok
  } catch (error) {
    console.error('N8N bağlantı testi başarısız:', error)
    return false
  }
}

// Dilekçe oluşturma için n8n'e istek gönder
export async function generatePetition(petitionType: string, userData: Record<string, any>): Promise<string> {
  try {
    const response = await fetch(N8N_PETITION_WEBHOOK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        petition_type: petitionType,
        user_data: userData
      }),
    })

    if (!response.ok) {
      throw new Error(`n8n petition webhook hatası: ${response.status}`)
    }

    const data = await response.json()
    return data.petition_content || 'Dilekçe oluşturulamadı'
  } catch (error) {
    console.error('n8n petition hatası:', error)
    throw error
  }
}