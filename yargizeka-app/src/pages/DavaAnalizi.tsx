import React, { useState, useRef } from 'react'
import { BarChart3, Upload, FileText, AlertTriangle, CheckCircle, Loader, Download } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { useAppStore } from '../lib/store'

interface CaseAnalysis {
  id: number
  case_title: string
  case_content: string
  analysis_result: {
    summary: string
    risk_factors: string[]
    recommendations: string[]
    similar_cases: string[]
    estimated_duration: string
    success_probability: number
  }
  risk_score: number
  created_at: string
}

const DavaAnalizi: React.FC = () => {
  const { user } = useAppStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [caseTitle, setCaseTitle] = useState('')
  const [caseContent, setCaseContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState<CaseAnalysis | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [savedAnalyses, setSavedAnalyses] = useState<CaseAnalysis[]>([])

  React.useEffect(() => {
    loadSavedAnalyses()
  }, [])

  const loadSavedAnalyses = async () => {
    try {
      const { data, error } = await supabase
        .from('yargizeka.case_analyses')
        .select('*')
        .eq('user_id', user?.user_id)
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) throw error
      setSavedAnalyses(data || [])
    } catch (error: any) {
      console.error('Kaydedilmiş analizler yüklenirken hata:', error)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      readFileContent(file)
    }
  }

  const readFileContent = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      setCaseContent(content)
      setCaseTitle(file.name.replace(/\.[^/.]+$/, ''))
    }
    reader.readAsText(file)
  }

  const analyzeCase = async () => {
    if (!caseContent.trim() || !caseTitle.trim()) {
      setError('Lütfen dava başlığı ve içeriği girin')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Gerçek uygulamada burası n8n workflow'una gönderilecek
      // Şimdilik mock analiz sonucu oluşturuyoruz
      const mockAnalysis = {
        summary: `${caseTitle} davası için detaylı analiz tamamlandı. Dava, ${Math.floor(Math.random() * 12 + 1)} ay sürebilir.`,
        risk_factors: [
          'Kanıt yetersizliği riski mevcut',
          'Karşı taraf güçlü savunma hazırlayabilir',
          'Emsal kararlar lehte değil'
        ],
        recommendations: [
          'Ek kanıt toplama çalışması yapılmalı',
          'Uzman bilirkişi desteği alınmalı',
          'Sulh müzakeresi değerlendirilmeli'
        ],
        similar_cases: [
          'Yargıtay 4. HD, 2023/1234 sayılı karar',
          'Yargıtay 11. HD, 2022/5678 sayılı karar'
        ],
        estimated_duration: `${Math.floor(Math.random() * 12 + 6)} ay`,
        success_probability: Math.floor(Math.random() * 40 + 40)
      }

      const riskScore = 100 - mockAnalysis.success_probability

      // Analizi veritabanına kaydet
      const { data, error } = await supabase
        .from('yargizeka.case_analyses')
        .insert({
          user_id: user?.user_id,
          case_title: caseTitle,
          case_content: caseContent,
          analysis_result: mockAnalysis,
          risk_score: riskScore
        })
        .select()
        .single()

      if (error) throw error

      setAnalysis({ ...data, analysis_result: mockAnalysis })

      // Kullanım logunu kaydet
      await supabase
        .from('yargizeka.usage_logs')
        .insert({
          user_id: user?.user_id,
          action_type: 'case_analyzed',
          tokens_used: Math.ceil(caseContent.length / 4),
          metadata: { case_title: caseTitle }
        })

      loadSavedAnalyses()

    } catch (error: any) {
      console.error('Dava analizi sırasında hata:', error)
      setError('Analiz gerçekleştirilemedi. Lütfen tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = (score: number) => {
    if (score <= 30) return 'green'
    if (score <= 60) return 'yellow'
    return 'red'
  }

  const downloadAnalysis = () => {
    if (!analysis) return

    const content = `
DAVA ANALİZİ RAPORU
==================

Dava Başlığı: ${analysis.case_title}
Tarih: ${new Date(analysis.created_at).toLocaleDateString('tr-TR')}
Risk Skoru: ${analysis.risk_score}/100

ÖZET
----
${analysis.analysis_result.summary}

RİSK FAKTÖRLERİ
---------------
${analysis.analysis_result.risk_factors.map(risk => `• ${risk}`).join('\n')}

ÖNERİLER
--------
${analysis.analysis_result.recommendations.map(rec => `• ${rec}`).join('\n')}

BENZER DAVALAR
--------------
${analysis.analysis_result.similar_cases.map(case_ => `• ${case_}`).join('\n')}

TAHMİNİ SÜRE: ${analysis.analysis_result.estimated_duration}
BAŞARI OLASILĞI: %${analysis.analysis_result.success_probability}
    `.trim()

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `dava_analizi_${analysis.case_title}_${new Date().toISOString().split('T')[0]}.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="dava-analizi">
      <div className="page-header">
        <div className="page-title-section">
          <BarChart3 className="page-icon" size={32} />
          <div>
            <h1 className="page-title">Dava Analizi</h1>
            <p className="page-subtitle">AI destekli dava risk analizi ve strateji önerileri</p>
          </div>
        </div>
      </div>

      <div className="analiz-content">
        <div className="analiz-form">
          <div className="form-section">
            <h2 className="section-title">Dava Bilgileri</h2>
            
            <div className="form-group">
              <label htmlFor="caseTitle" className="form-label">Dava Başlığı</label>
              <input
                id="caseTitle"
                type="text"
                value={caseTitle}
                onChange={(e) => setCaseTitle(e.target.value)}
                className="form-input"
                placeholder="Dava başlığını girin"
              />
            </div>

            <div className="upload-section">
              <div className="upload-area" onClick={() => fileInputRef.current?.click()}>
                <Upload className="upload-icon" size={48} />
                <h3>Dava Dosyası Yükle</h3>
                <p>PDF, DOCX veya TXT formatında dosya seçin</p>
                {selectedFile && (
                  <div className="selected-file">
                    <FileText size={16} />
                    <span>{selectedFile.name}</span>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileUpload}
                className="file-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="caseContent" className="form-label">Dava İçeriği</label>
              <textarea
                id="caseContent"
                value={caseContent}
                onChange={(e) => setCaseContent(e.target.value)}
                className="form-textarea"
                rows={10}
                placeholder="Dava içeriğini buraya yazın veya dosya yükleyin"
              />
            </div>

            <button
              onClick={analyzeCase}
              disabled={loading || !caseContent.trim() || !caseTitle.trim()}
              className="analyze-btn"
            >
              {loading ? (
                <>
                  <Loader className="btn-icon spin" size={18} />
                  Analiz Ediliyor...
                </>
              ) : (
                <>
                  <BarChart3 className="btn-icon" size={18} />
                  Analiz Et
                </>
              )}
            </button>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
          </div>
        </div>

        {analysis && (
          <div className="analiz-result">
            <div className="result-header">
              <h2 className="section-title">Analiz Sonuçları</h2>
              <button onClick={downloadAnalysis} className="action-btn">
                <Download size={18} />
                Raporu İndir
              </button>
            </div>

            <div className="risk-score-card">
              <div className={`risk-score risk-${getRiskColor(analysis.risk_score)}`}>
                <div className="risk-number">{analysis.risk_score}</div>
                <div className="risk-label">Risk Skoru</div>
              </div>
              <div>
                <h3>Genel Değerlendirme</h3>
                <p>{analysis.analysis_result.summary}</p>
              </div>
            </div>

            <div className="analysis-sections">
              <div className="analysis-section">
                <h3 className="analysis-title">
                  <AlertTriangle className="section-icon" size={20} />
                  Risk Faktörleri
                </h3>
                <ul className="analysis-list">
                  {analysis.analysis_result.risk_factors.map((risk, index) => (
                    <li key={index} className="risk-item">{risk}</li>
                  ))}
                </ul>
              </div>

              <div className="analysis-section">
                <h3 className="analysis-title">
                  <CheckCircle className="section-icon" size={20} />
                  Öneriler
                </h3>
                <ul className="analysis-list">
                  {analysis.analysis_result.recommendations.map((rec, index) => (
                    <li key={index} className="recommendation-item">{rec}</li>
                  ))}
                </ul>
              </div>

              <div className="analysis-section">
                <h3 className="analysis-title">
                  <FileText className="section-icon" size={20} />
                  Benzer Davalar
                </h3>
                <ul className="analysis-list">
                  {analysis.analysis_result.similar_cases.map((case_, index) => (
                    <li key={index} className="case-item">{case_}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="analysis-stats">
              <div className="stat-item">
                <span className="stat-label">Tahmini Süre</span>
                <span className="stat-value">{analysis.analysis_result.estimated_duration}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Başarı Olasılığı</span>
                <span className="stat-value">%{analysis.analysis_result.success_probability}</span>
              </div>
            </div>
          </div>
        )}

        {savedAnalyses.length > 0 && (
          <div className="saved-analyses">
            <h2 className="section-title">Son Analizler</h2>
            <div className="analyses-list">
              {savedAnalyses.map((savedAnalysis) => (
                <div key={savedAnalysis.id} className="analysis-card" onClick={() => setAnalysis(savedAnalysis)}>
                  <h3 className="analysis-card-title">{savedAnalysis.case_title}</h3>
                  <div className="analysis-card-meta">
                    <span className={`risk-badge risk-${getRiskColor(savedAnalysis.risk_score)}`}>
                      Risk: {savedAnalysis.risk_score}
                    </span>
                    <span className="analysis-date">
                      {new Date(savedAnalysis.created_at).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DavaAnalizi