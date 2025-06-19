// n8n Webhook URL'leri
const N8N_CHAT_WEBHOOK = import.meta.env.VITE_N8N_CHAT_WEBHOOK || 'http://localhost:5678/webhook/yargizeka-chat'
const N8N_PETITION_WEBHOOK = import.meta.env.VITE_N8N_PETITION_WEBHOOK || 'http://localhost:5678/webhook/yargizeka-petition'

// Sohbet için n8n'e istek gönder
export async function sendChatMessage(question: string): Promise<string> {
  try {
    const response = await fetch(N8N_CHAT_WEBHOOK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question }),
    })

    if (!response.ok) {
      throw new Error(`n8n chat webhook hatası: ${response.status}`)
    }

    const data = await response.json()
    return data.response || 'Yanıt alınamadı'
  } catch (error) {
    console.error('n8n chat hatası:', error)
    throw error
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