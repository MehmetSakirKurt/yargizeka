import React, { useState, useEffect } from 'react'
import { Search, Filter, Save, Calendar, Building, FileText, BookOpen, Loader } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { useAppStore } from '../lib/store'

interface SearchResult {
  id: string
  title: string
  court: string
  date: string
  case_number: string
  summary: string
  content: string
  relevance_score: number
}

interface SavedSearch {
  id: number
  title?: string
  search_query: string
  filters: {
    court_type?: string
    date_range?: string
    case_type?: string
  }
  created_at: string
}

const YargitayArama: React.FC = () => {
  const { user } = useAppStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([])
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null)
  
  // Filtreler
  const [filters, setFilters] = useState({
    court_type: '',
    date_range: '',
    case_type: ''
  })
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    loadSavedSearches()
  }, [])

  const loadSavedSearches = async () => {
    try {
      const { data, error } = await supabase
        .from('yargizeka.saved_searches')
        .select('*')
        .eq('user_id', user?.user_id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      setSavedSearches(data || [])
    } catch (error: any) {
      console.error('Kaydedilmiş aramalar yüklenirken hata:', error)
    }
  }

  const performSearch = async () => {
    if (!searchQuery.trim()) {
      setError('Lütfen arama terimi girin')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Gerçek uygulamada burası Milvus vektör veritabanında semantik arama yapacak
      // Şimdilik mock veri döndürüyoruz
      const mockResults: SearchResult[] = [
        {
          id: '1',
          title: 'Tazminat Davası - Manevi Tazminat Hesaplaması',
          court: 'Yargıtay 4. Hukuk Dairesi',
          date: '2023-11-15',
          case_number: '2023/12345',
          summary: 'Trafik kazası sonucu manevi tazminat miktarının belirlenmesine ilişkin karar.',
          content: `Bu davada, trafik kazası sonucu yaralanan davacının manevi tazminat talebinin değerlendirilmesi söz konusudur. 
          Mahkeme, kazanın ağırlığı, davacının yaşı ve sosyal durumu gibi faktörleri değerlendirmiştir...`,
          relevance_score: 0.95
        },
        {
          id: '2',
          title: 'İş Kazası Tazminat Davası',
          court: 'Yargıtay 21. Hukuk Dairesi',
          date: '2023-10-22',
          case_number: '2023/67890',
          summary: 'İşveren sorumluluğu kapsamında iş kazası tazminatı hesaplaması.',
          content: `İş kazası sonucu meydana gelen yaralanma nedeniyle açılan tazminat davasında, 
          işverenin sorumluluğu ve tazminat miktarının hesaplanması konuları incelenmiştir...`,
          relevance_score: 0.87
        },
        {
          id: '3',
          title: 'Kira Artış Oranı Uyuşmazlığı',
          court: 'Yargıtay 6. Hukuk Dairesi',
          date: '2023-09-30',
          case_number: '2023/34567',
          summary: 'Kira artış oranlarının belirlenmesi ve uygulanmasına ilişkin karar.',
          content: `Kiraya verenin, yasal sınırları aşan kira artışı talebine karşı kiracının açtığı 
          tespit davası kapsamında kira artış oranlarının değerlendirilmesi...`,
          relevance_score: 0.73
        }
      ]

      // Arama sorgusuna göre sonuçları filtrele (basit contains kontrolü)
      const filteredResults = mockResults.filter(result => 
        result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.content.toLowerCase().includes(searchQuery.toLowerCase())
      )

      setSearchResults(filteredResults)

      // Kullanım logunu kaydet
      await supabase
        .from('yargizeka.usage_logs')
        .insert({
          user_id: user?.user_id,
          action_type: 'legal_search',
          tokens_used: Math.ceil(searchQuery.length / 4),
          metadata: { 
            query: searchQuery,
            results_count: filteredResults.length,
            filters: filters
          }
        })

    } catch (error: any) {
      console.error('Arama hatası:', error)
      setError('Arama gerçekleştirilemedi. Lütfen tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }

  const saveSearch = async () => {
    if (!searchQuery.trim()) return

    try {
      const { error } = await supabase
        .from('yargizeka.saved_searches')
        .insert({
          user_id: user?.user_id,
          search_query: searchQuery,
          filters: filters,
          title: searchQuery.length > 50 ? searchQuery.substring(0, 50) + '...' : searchQuery
        })

      if (error) throw error
      
      loadSavedSearches()
      alert('Arama kaydedildi!')
    } catch (error: any) {
      console.error('Arama kaydedilirken hata:', error)
      alert('Arama kaydedilemedi')
    }
  }

  const loadSavedSearch = (savedSearch: SavedSearch) => {
    setSearchQuery(savedSearch.search_query)
    setFilters({
      court_type: savedSearch.filters.court_type || '',
      date_range: savedSearch.filters.date_range || '',
      case_type: savedSearch.filters.case_type || ''
    })
    performSearch()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      performSearch()
    }
  }

  const courtTypes = [
    { value: '', label: 'Tüm Mahkemeler' },
    { value: 'yargitay', label: 'Yargıtay' },
    { value: 'danistay', label: 'Danıştay' },
    { value: 'anayasa', label: 'Anayasa Mahkemesi' }
  ]

  const dateRanges = [
    { value: '', label: 'Tüm Tarihler' },
    { value: '2024', label: '2024' },
    { value: '2023', label: '2023' },
    { value: '2022', label: '2022' },
    { value: '2021', label: '2021' }
  ]

  const caseTypes = [
    { value: '', label: 'Tüm Dava Türleri' },
    { value: 'hukuk', label: 'Hukuk Davası' },
    { value: 'ceza', label: 'Ceza Davası' },
    { value: 'idari', label: 'İdari Dava' },
    { value: 'icra', label: 'İcra-İflas' }
  ]

  return (
    <div className="yargitay-arama">
      <div className="page-header">
        <div className="page-title-section">
          <Search className="page-icon" size={32} />
          <div>
            <h1 className="page-title">Yargıtay Arama</h1>
            <p className="page-subtitle">Yargıtay ve Danıştay kararlarında semantik arama</p>
          </div>
        </div>
      </div>

      <div className="arama-content">
        <div className="search-section">
          <div className="search-input-container">
            <div className="search-input-wrapper">
              <Search className="search-icon" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Arama teriminizi girin (ör: tazminat hesaplaması, kira artışı)"
                className="search-input"
              />
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`filter-btn ${showFilters ? 'active' : ''}`}
              >
                <Filter size={18} />
              </button>
            </div>
            
            <div className="search-actions">
              <button
                onClick={performSearch}
                disabled={loading || !searchQuery.trim()}
                className="search-btn"
              >
                {loading ? (
                  <>
                    <Loader className="btn-icon spin" size={18} />
                    Aranıyor...
                  </>
                ) : (
                  <>
                    <Search className="btn-icon" size={18} />
                    Ara
                  </>
                )}
              </button>
              
              <button
                onClick={saveSearch}
                disabled={!searchQuery.trim()}
                className="save-search-btn"
                title="Aramayı Kaydet"
              >
                <Save size={18} />
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="search-filters">
              <div className="filter-group">
                <label className="filter-label">Mahkeme Türü</label>
                <select
                  value={filters.court_type}
                  onChange={(e) => setFilters(prev => ({ ...prev, court_type: e.target.value }))}
                  className="filter-select"
                >
                  {courtTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label className="filter-label">Tarih Aralığı</label>
                <select
                  value={filters.date_range}
                  onChange={(e) => setFilters(prev => ({ ...prev, date_range: e.target.value }))}
                  className="filter-select"
                >
                  {dateRanges.map(range => (
                    <option key={range.value} value={range.value}>{range.label}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label className="filter-label">Dava Türü</label>
                <select
                  value={filters.case_type}
                  onChange={(e) => setFilters(prev => ({ ...prev, case_type: e.target.value }))}
                  className="filter-select"
                >
                  {caseTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
        </div>

        {savedSearches.length > 0 && (
          <div className="saved-searches-section">
            <h3 className="section-title">Kayıtlı Aramalarım</h3>
            <div className="saved-searches-list">
              {savedSearches.map((search) => (
                <button
                  key={search.id}
                  onClick={() => loadSavedSearch(search)}
                  className="saved-search-item"
                >
                  <BookOpen size={16} />
                  <span className="saved-search-text">{search.title || search.search_query}</span>
                  <span className="saved-search-date">
                    {new Date(search.created_at).toLocaleDateString('tr-TR')}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="results-section">
          {searchResults.length > 0 && (
            <>
              <div className="results-header">
                <h3 className="section-title">
                  Arama Sonuçları ({searchResults.length})
                </h3>
              </div>
              
              <div className="results-grid">
                <div className="results-list">
                  {searchResults.map((result) => (
                    <div
                      key={result.id}
                      className={`result-card ${selectedResult?.id === result.id ? 'selected' : ''}`}
                      onClick={() => setSelectedResult(result)}
                    >
                      <div className="result-header">
                        <h4 className="result-title">{result.title}</h4>
                        <div className="relevance-score">
                          {Math.round(result.relevance_score * 100)}%
                        </div>
                      </div>
                      
                      <div className="result-meta">
                        <div className="result-meta-item">
                          <Building size={14} />
                          <span>{result.court}</span>
                        </div>
                        <div className="result-meta-item">
                          <Calendar size={14} />
                          <span>{new Date(result.date).toLocaleDateString('tr-TR')}</span>
                        </div>
                        <div className="result-meta-item">
                          <FileText size={14} />
                          <span>{result.case_number}</span>
                        </div>
                      </div>
                      
                      <p className="result-summary">{result.summary}</p>
                    </div>
                  ))}
                </div>

                {selectedResult && (
                  <div className="result-detail">
                    <div className="detail-header">
                      <h3 className="detail-title">{selectedResult.title}</h3>
                      <div className="detail-meta">
                        <span className="detail-court">{selectedResult.court}</span>
                        <span className="detail-date">
                          {new Date(selectedResult.date).toLocaleDateString('tr-TR')}
                        </span>
                        <span className="detail-case-number">{selectedResult.case_number}</span>
                      </div>
                    </div>
                    
                    <div className="detail-content">
                      <h4>Özet</h4>
                      <p>{selectedResult.summary}</p>
                      
                      <h4>Karar Metni</h4>
                      <div className="detail-text">
                        {selectedResult.content}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {searchResults.length === 0 && searchQuery && !loading && (
            <div className="no-results">
              <Search size={48} />
              <h3>Sonuç Bulunamadı</h3>
              <p>"{searchQuery}" için herhangi bir karar bulunamadı. Farklı anahtar kelimeler deneyebilirsiniz.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default YargitayArama