import React, { useState, useEffect } from 'react'
import { FileText, Download, Loader } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { generatePetition } from '../lib/n8nClient'
import { useAppStore } from '../lib/store'

interface PetitionTemplate {
  id: number
  type: string
  template_content: string
  ai_prompt: string
}

const DilekceYazma: React.FC = () => {
  const { user } = useAppStore()
  const [templates, setTemplates] = useState<PetitionTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [generatedPetition, setGeneratedPetition] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('yargizeka.petition_templates')
        .select('*')
        .eq('is_active', true)

      if (error) throw error
      setTemplates(data || [])
    } catch (error: any) {
      console.error('Şablonlar yüklenirken hata:', error)
      setError('Şablonlar yüklenemedi')
    }
  }

  const handleTemplateChange = (templateType: string) => {
    setSelectedTemplate(templateType)
    setGeneratedPetition('')
    setFormData({})
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const generatePetitionContent = async () => {
    if (!selectedTemplate || Object.keys(formData).length === 0) {
      setError('Lütfen şablon seçin ve gerekli alanları doldurun')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const petitionContent = await generatePetition(selectedTemplate, formData)
      setGeneratedPetition(petitionContent)

      // Kullanım logunu kaydet
      await supabase
        .from('yargizeka.usage_logs')
        .insert({
          user_id: user?.user_id,
          action_type: 'petition_generated',
          tokens_used: Math.ceil(petitionContent.length / 4),
          metadata: { petition_type: selectedTemplate }
        })

    } catch (error: any) {
      console.error('Dilekçe oluşturulurken hata:', error)
      setError('Dilekçe oluşturulamadı. Lütfen tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }

  const downloadPetition = () => {
    if (!generatedPetition) return

    const blob = new Blob([generatedPetition], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `dilekce_${selectedTemplate}_${new Date().toISOString().split('T')[0]}.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  const renderFormFields = () => {
    const template = templates.find(t => t.type === selectedTemplate)
    if (!template) return null

    // Şablon içindeki {field} alanlarını bul
    const fields = template.template_content.match(/\{([^}]+)\}/g)?.map(f => f.slice(1, -1)) || []

    return fields.map(field => (
      <div key={field} className="form-group">
        <label htmlFor={field} className="form-label">
          {field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </label>
        <input
          id={field}
          type="text"
          value={formData[field] || ''}
          onChange={(e) => handleInputChange(field, e.target.value)}
          className="form-input"
          placeholder={`${field} bilgisini girin`}
        />
      </div>
    ))
  }

  return (
    <div className="dilekce-yazma">
      <div className="page-header">
        <div className="page-title-section">
          <FileText className="page-icon" size={32} />
          <div>
            <h1 className="page-title">Dilekçe Yazma</h1>
            <p className="page-subtitle">AI destekli dilekçe hazırlama aracı</p>
          </div>
        </div>
      </div>

      <div className="dilekce-content">
        <div className="dilekce-form">
          <div className="form-section">
            <h2 className="section-title">Dilekçe Türü Seçin</h2>
            <div className="template-grid">
              {templates.map(template => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateChange(template.type)}
                  className={`template-card ${selectedTemplate === template.type ? 'selected' : ''}`}
                >
                  <h3 className="template-title">
                    {template.type === 'tazminat' ? 'Tazminat Davası' :
                     template.type === 'bosanma' ? 'Boşanma Davası' :
                     template.type === 'icra_itiraz' ? 'İcra İtirazı' :
                     template.type}
                  </h3>
                </button>
              ))}
            </div>
          </div>

          {selectedTemplate && (
            <div className="form-section">
              <h2 className="section-title">Bilgileri Doldurun</h2>
              <div className="form-fields">
                {renderFormFields()}
              </div>
              
              <button
                onClick={generatePetitionContent}
                disabled={loading || Object.keys(formData).length === 0}
                className="generate-btn"
              >
                {loading ? (
                  <>
                    <Loader className="btn-icon spin" size={18} />
                    Oluşturuluyor...
                  </>
                ) : (
                  <>
                    <FileText className="btn-icon" size={18} />
                    Dilekçe Oluştur
                  </>
                )}
              </button>
            </div>
          )}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
        </div>

        {generatedPetition && (
          <div className="dilekce-result">
            <div className="result-header">
              <h2 className="section-title">Oluşturulan Dilekçe</h2>
              <div className="result-actions">
                <button onClick={downloadPetition} className="action-btn">
                  <Download size={18} />
                  İndir
                </button>
              </div>
            </div>
            
            <div className="petition-content">
              <pre className="petition-text">{generatedPetition}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DilekceYazma