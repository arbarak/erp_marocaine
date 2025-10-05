import React, { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  MessageSquare,
  FileText,
  Search,
  Brain,
  TrendingUp,
  TrendingDown,
  Heart,
  Frown,
  Smile,
  Meh,
  AlertTriangle,
  CheckCircle,
  Eye,
  Download,
  Upload,
  Filter,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Globe,
  Users,
  Clock,
  Tag,
  Hash,
  Lightbulb,
  Target,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Dialog } from '@/components/ui/Dialog'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { formatDate, formatPercentage } from '@/lib/utils'
import { ResponsiveContainer, LineChart, AreaChart, BarChart, PieChart as RechartsPieChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Area, Bar, Line, Cell } from 'recharts'

interface DocumentAnalysis {
  id: string
  documentName: string
  documentType: 'contract' | 'email' | 'report' | 'feedback' | 'invoice' | 'other'
  content: string
  language: string
  sentiment: SentimentAnalysis
  entities: NamedEntity[]
  keywords: Keyword[]
  summary: string
  topics: Topic[]
  readabilityScore: number
  processedAt: string
  confidence: number
}

interface SentimentAnalysis {
  overall: 'positive' | 'negative' | 'neutral'
  score: number
  confidence: number
  emotions: {
    joy: number
    anger: number
    fear: number
    sadness: number
    surprise: number
  }
}

interface NamedEntity {
  text: string
  label: 'PERSON' | 'ORG' | 'LOCATION' | 'DATE' | 'MONEY' | 'PRODUCT' | 'EMAIL' | 'PHONE'
  confidence: number
  start: number
  end: number
}

interface Keyword {
  text: string
  relevance: number
  frequency: number
  category?: string
}

interface Topic {
  name: string
  confidence: number
  keywords: string[]
}

interface IntelligentSearch {
  id: string
  query: string
  intent: 'search' | 'question' | 'command' | 'request'
  entities: NamedEntity[]
  results: SearchResult[]
  suggestions: string[]
  timestamp: string
  userId: string
}

interface SearchResult {
  id: string
  title: string
  content: string
  type: 'document' | 'product' | 'customer' | 'order' | 'invoice'
  relevance: number
  highlights: string[]
  metadata: Record<string, any>
}

interface ConversationAnalysis {
  id: string
  conversationType: 'support' | 'sales' | 'feedback' | 'complaint'
  participants: string[]
  messages: Message[]
  sentiment: SentimentAnalysis
  topics: Topic[]
  resolution: 'resolved' | 'pending' | 'escalated'
  satisfaction?: number
  duration: number
  createdAt: string
}

interface Message {
  id: string
  sender: string
  content: string
  timestamp: string
  sentiment: SentimentAnalysis
  intent: string
}

export function NaturalLanguageProcessing() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'sentiment' | 'search' | 'conversations'>('overview')
  const [documentAnalyses, setDocumentAnalyses] = useState<DocumentAnalysis[]>([])
  const [intelligentSearches, setIntelligentSearches] = useState<IntelligentSearch[]>([])
  const [conversationAnalyses, setConversationAnalyses] = useState<ConversationAnalysis[]>([])
  const [selectedDocument, setSelectedDocument] = useState<DocumentAnalysis | null>(null)
  const [showDocumentDialog, setShowDocumentDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [analysisText, setAnalysisText] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // Mock data initialization
  useEffect(() => {
    const mockDocuments: DocumentAnalysis[] = [
      {
        id: '1',
        documentName: 'Contrat_Client_ABC_2024.pdf',
        documentType: 'contract',
        content: 'Contrat de prestation de services entre la société XYZ et le client ABC pour la fourniture de solutions informatiques...',
        language: 'fr',
        sentiment: {
          overall: 'neutral',
          score: 0.1,
          confidence: 85,
          emotions: { joy: 0.2, anger: 0.1, fear: 0.1, sadness: 0.1, surprise: 0.1 }
        },
        entities: [
          { text: 'ABC', label: 'ORG', confidence: 95, start: 45, end: 48 },
          { text: 'XYZ', label: 'ORG', confidence: 92, start: 25, end: 28 },
          { text: '2024', label: 'DATE', confidence: 98, start: 15, end: 19 }
        ],
        keywords: [
          { text: 'contrat', relevance: 0.95, frequency: 8, category: 'legal' },
          { text: 'prestation', relevance: 0.88, frequency: 5, category: 'service' },
          { text: 'informatique', relevance: 0.82, frequency: 3, category: 'technology' }
        ],
        summary: 'Contrat de prestation de services informatiques entre XYZ et ABC avec clauses de confidentialité et conditions de paiement.',
        topics: [
          { name: 'Services informatiques', confidence: 0.92, keywords: ['informatique', 'solutions', 'services'] },
          { name: 'Conditions contractuelles', confidence: 0.87, keywords: ['contrat', 'clauses', 'conditions'] }
        ],
        readabilityScore: 75,
        processedAt: '2024-01-20T10:30:00Z',
        confidence: 89
      },
      {
        id: '2',
        documentName: 'Feedback_Client_Janvier.txt',
        documentType: 'feedback',
        content: 'Je suis très satisfait du service client. L\'équipe a été réactive et professionnelle. Cependant, les délais de livraison pourraient être améliorés.',
        language: 'fr',
        sentiment: {
          overall: 'positive',
          score: 0.6,
          confidence: 92,
          emotions: { joy: 0.7, anger: 0.1, fear: 0.0, sadness: 0.1, surprise: 0.1 }
        },
        entities: [
          { text: 'Janvier', label: 'DATE', confidence: 95, start: 0, end: 7 },
          { text: 'équipe', label: 'ORG', confidence: 78, start: 65, end: 71 }
        ],
        keywords: [
          { text: 'satisfait', relevance: 0.92, frequency: 1, category: 'sentiment' },
          { text: 'service client', relevance: 0.89, frequency: 1, category: 'service' },
          { text: 'délais', relevance: 0.75, frequency: 1, category: 'logistics' }
        ],
        summary: 'Feedback positif sur le service client avec suggestion d\'amélioration des délais de livraison.',
        topics: [
          { name: 'Service client', confidence: 0.94, keywords: ['service', 'client', 'équipe'] },
          { name: 'Livraison', confidence: 0.81, keywords: ['délais', 'livraison', 'améliorés'] }
        ],
        readabilityScore: 85,
        processedAt: '2024-01-20T09:15:00Z',
        confidence: 92
      },
      {
        id: '3',
        documentName: 'Email_Reclamation_Client.eml',
        documentType: 'email',
        content: 'Bonjour, je suis mécontent de ma dernière commande. Le produit reçu ne correspond pas à la description et la qualité est décevante.',
        language: 'fr',
        sentiment: {
          overall: 'negative',
          score: -0.7,
          confidence: 88,
          emotions: { joy: 0.1, anger: 0.6, fear: 0.2, sadness: 0.4, surprise: 0.3 }
        },
        entities: [
          { text: 'commande', label: 'PRODUCT', confidence: 82, start: 35, end: 43 },
          { text: 'produit', label: 'PRODUCT', confidence: 85, start: 48, end: 55 }
        ],
        keywords: [
          { text: 'mécontent', relevance: 0.95, frequency: 1, category: 'sentiment' },
          { text: 'commande', relevance: 0.88, frequency: 1, category: 'order' },
          { text: 'qualité', relevance: 0.82, frequency: 1, category: 'quality' }
        ],
        summary: 'Réclamation client concernant un produit non conforme à la description avec problème de qualité.',
        topics: [
          { name: 'Réclamation produit', confidence: 0.91, keywords: ['mécontent', 'produit', 'qualité'] },
          { name: 'Non-conformité', confidence: 0.86, keywords: ['correspond', 'description', 'décevante'] }
        ],
        readabilityScore: 78,
        processedAt: '2024-01-20T08:45:00Z',
        confidence: 88
      }
    ]

    const mockSearches: IntelligentSearch[] = [
      {
        id: '1',
        query: 'Quels sont les clients insatisfaits ce mois-ci ?',
        intent: 'question',
        entities: [
          { text: 'clients', label: 'PERSON', confidence: 90, start: 15, end: 22 },
          { text: 'ce mois-ci', label: 'DATE', confidence: 95, start: 35, end: 45 }
        ],
        results: [
          {
            id: 'result1',
            title: 'Feedback négatif - Client ABC',
            content: 'Réclamation concernant la qualité du service...',
            type: 'document',
            relevance: 0.92,
            highlights: ['insatisfait', 'réclamation', 'qualité'],
            metadata: { sentiment: 'negative', date: '2024-01-15' }
          }
        ],
        suggestions: [
          'Afficher les réclamations par catégorie',
          'Analyser les tendances de satisfaction',
          'Générer un rapport de satisfaction client'
        ],
        timestamp: '2024-01-20T11:00:00Z',
        userId: 'user123'
      }
    ]

    const mockConversations: ConversationAnalysis[] = [
      {
        id: '1',
        conversationType: 'support',
        participants: ['Agent_Sarah', 'Client_Mohamed'],
        messages: [
          {
            id: 'msg1',
            sender: 'Client_Mohamed',
            content: 'Bonjour, j\'ai un problème avec ma commande',
            timestamp: '2024-01-20T10:00:00Z',
            sentiment: { overall: 'neutral', score: 0.1, confidence: 80, emotions: { joy: 0.1, anger: 0.2, fear: 0.3, sadness: 0.2, surprise: 0.2 } },
            intent: 'problem_report'
          },
          {
            id: 'msg2',
            sender: 'Agent_Sarah',
            content: 'Bonjour Mohamed, je vais vous aider. Pouvez-vous me donner votre numéro de commande ?',
            timestamp: '2024-01-20T10:01:00Z',
            sentiment: { overall: 'positive', score: 0.5, confidence: 85, emotions: { joy: 0.6, anger: 0.0, fear: 0.1, sadness: 0.1, surprise: 0.2 } },
            intent: 'help_offer'
          }
        ],
        sentiment: {
          overall: 'neutral',
          score: 0.3,
          confidence: 82,
          emotions: { joy: 0.35, anger: 0.1, fear: 0.2, sadness: 0.15, surprise: 0.2 }
        },
        topics: [
          { name: 'Support technique', confidence: 0.89, keywords: ['problème', 'commande', 'aide'] }
        ],
        resolution: 'resolved',
        satisfaction: 4.2,
        duration: 15,
        createdAt: '2024-01-20T10:00:00Z'
      }
    ]

    setDocumentAnalyses(mockDocuments)
    setIntelligentSearches(mockSearches)
    setConversationAnalyses(mockConversations)
  }, [])

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <Smile className="h-4 w-4 text-success" />
      case 'negative':
        return <Frown className="h-4 w-4 text-error" />
      default:
        return <Meh className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <Badge variant="success">Positif</Badge>
      case 'negative':
        return <Badge variant="error">Négatif</Badge>
      default:
        return <Badge variant="neutral">Neutre</Badge>
    }
  }

  const getDocumentTypeIcon = (type: string) => {
    switch (type) {
      case 'contract':
        return <FileText className="h-4 w-4 text-blue-500" />
      case 'email':
        return <MessageSquare className="h-4 w-4 text-green-500" />
      case 'feedback':
        return <Heart className="h-4 w-4 text-red-500" />
      case 'report':
        return <BarChart3 className="h-4 w-4 text-purple-500" />
      default:
        return <FileText className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getEntityBadge = (label: string) => {
    const colors = {
      PERSON: 'bg-blue-100 text-blue-800',
      ORG: 'bg-green-100 text-green-800',
      LOCATION: 'bg-purple-100 text-purple-800',
      DATE: 'bg-orange-100 text-orange-800',
      MONEY: 'bg-yellow-100 text-yellow-800',
      PRODUCT: 'bg-red-100 text-red-800',
      EMAIL: 'bg-indigo-100 text-indigo-800',
      PHONE: 'bg-pink-100 text-pink-800'
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[label as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {label}
      </span>
    )
  }

  const handleAnalyzeText = async () => {
    if (!analysisText.trim()) return
    
    setIsAnalyzing(true)
    
    // Simulate API call
    setTimeout(() => {
      const newAnalysis: DocumentAnalysis = {
        id: Date.now().toString(),
        documentName: 'Analyse_Temps_Reel.txt',
        documentType: 'other',
        content: analysisText,
        language: 'fr',
        sentiment: {
          overall: analysisText.includes('satisfait') || analysisText.includes('excellent') ? 'positive' :
                   analysisText.includes('mécontent') || analysisText.includes('problème') ? 'negative' : 'neutral',
          score: Math.random() * 2 - 1,
          confidence: Math.floor(Math.random() * 20) + 80,
          emotions: {
            joy: Math.random() * 0.5,
            anger: Math.random() * 0.3,
            fear: Math.random() * 0.2,
            sadness: Math.random() * 0.3,
            surprise: Math.random() * 0.4
          }
        },
        entities: [],
        keywords: [],
        summary: analysisText.substring(0, 100) + '...',
        topics: [],
        readabilityScore: Math.floor(Math.random() * 30) + 70,
        processedAt: new Date().toISOString(),
        confidence: Math.floor(Math.random() * 20) + 80
      }
      
      setDocumentAnalyses(prev => [newAnalysis, ...prev])
      setAnalysisText('')
      setIsAnalyzing(false)
    }, 2000)
  }

  const handleViewDocument = (document: DocumentAnalysis) => {
    setSelectedDocument(document)
    setShowDocumentDialog(true)
  }

  const nlpMetrics = useMemo(() => {
    const totalDocuments = documentAnalyses.length
    const positiveDocuments = documentAnalyses.filter(d => d.sentiment.overall === 'positive').length
    const negativeDocuments = documentAnalyses.filter(d => d.sentiment.overall === 'negative').length
    const averageConfidence = documentAnalyses.reduce((acc, d) => acc + d.confidence, 0) / totalDocuments
    const averageReadability = documentAnalyses.reduce((acc, d) => acc + d.readabilityScore, 0) / totalDocuments

    return {
      totalDocuments,
      positiveDocuments,
      negativeDocuments,
      averageConfidence,
      averageReadability
    }
  }, [documentAnalyses])

  // Sample data for charts
  const sentimentTrends = [
    { name: 'Lun', positive: 12, negative: 3, neutral: 8 },
    { name: 'Mar', positive: 15, negative: 2, neutral: 10 },
    { name: 'Mer', positive: 18, negative: 4, neutral: 12 },
    { name: 'Jeu', positive: 14, negative: 6, neutral: 9 },
    { name: 'Ven', positive: 20, negative: 2, neutral: 11 },
    { name: 'Sam', positive: 16, negative: 3, neutral: 7 },
    { name: 'Dim', positive: 13, negative: 1, neutral: 5 },
  ]

  const topicDistribution = [
    { name: 'Service client', value: 35, color: '#3B82F6' },
    { name: 'Produits', value: 28, color: '#10B981' },
    { name: 'Livraison', value: 20, color: '#F59E0B' },
    { name: 'Facturation', value: 12, color: '#EF4444' },
    { name: 'Technique', value: 5, color: '#8B5CF6' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <MessageSquare className="h-6 w-6" />
            Traitement du Langage Naturel
          </h1>
          <p className="text-muted-foreground">
            Analyse intelligente de documents, sentiment et recherche sémantique
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Importer documents
          </Button>
          <Button>
            <Brain className="h-4 w-4 mr-2" />
            Nouvelle analyse
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        {[
          { id: 'overview', label: 'Vue d\'ensemble', icon: <Activity className="h-4 w-4" /> },
          { id: 'documents', label: 'Documents', icon: <FileText className="h-4 w-4" /> },
          { id: 'sentiment', label: 'Sentiment', icon: <Heart className="h-4 w-4" /> },
          { id: 'search', label: 'Recherche IA', icon: <Search className="h-4 w-4" /> },
          { id: 'conversations', label: 'Conversations', icon: <MessageSquare className="h-4 w-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* NLP Metrics */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-info/10 rounded-lg">
                <FileText className="h-5 w-5 text-info" />
              </div>
              <div>
                <h3 className="font-semibold">Documents analysés</h3>
                <p className="text-2xl font-bold text-info">{nlpMetrics.totalDocuments}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Total traité</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-success/10 rounded-lg">
                <Smile className="h-5 w-5 text-success" />
              </div>
              <div>
                <h3 className="font-semibold">Sentiment positif</h3>
                <p className="text-2xl font-bold text-success">{nlpMetrics.positiveDocuments}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {formatPercentage(nlpMetrics.positiveDocuments / nlpMetrics.totalDocuments)} du total
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-warning/10 rounded-lg">
                <Target className="h-5 w-5 text-warning" />
              </div>
              <div>
                <h3 className="font-semibold">Confiance moyenne</h3>
                <p className="text-2xl font-bold text-warning">{nlpMetrics.averageConfidence.toFixed(1)}%</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Précision IA</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple/10 rounded-lg">
                <BarChart3 className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <h3 className="font-semibold">Lisibilité moyenne</h3>
                <p className="text-2xl font-bold text-purple-500">{nlpMetrics.averageReadability.toFixed(0)}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Score de lisibilité</p>
          </Card>

          {/* Sentiment Trends Chart */}
          <Card className="p-6 md:col-span-2 lg:col-span-3">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Tendances du sentiment
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={sentimentTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="positive" stackId="1" stroke="#10B981" fill="#10B981" name="Positif" />
                <Area type="monotone" dataKey="neutral" stackId="1" stroke="#6B7280" fill="#6B7280" name="Neutre" />
                <Area type="monotone" dataKey="negative" stackId="1" stroke="#EF4444" fill="#EF4444" name="Négatif" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Topic Distribution */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Sujets principaux
            </h3>
            <div className="space-y-3">
              {topicDistribution.map((topic, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: topic.color }}
                    />
                    <span className="text-sm">{topic.name}</span>
                  </div>
                  <span className="font-medium">{topic.value}%</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Real-time Analysis */}
          <Card className="p-6 md:col-span-2 lg:col-span-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Analyse en temps réel
            </h3>
            <div className="space-y-4">
              <Textarea
                placeholder="Saisissez votre texte à analyser..."
                value={analysisText}
                onChange={(e) => setAnalysisText(e.target.value)}
                rows={4}
                className="w-full"
              />
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  {analysisText.length} caractères
                </div>
                <Button 
                  onClick={handleAnalyzeText}
                  disabled={!analysisText.trim() || isAnalyzing}
                >
                  {isAnalyzing ? (
                    <>
                      <LoadingSpinner className="h-4 w-4 mr-2" />
                      Analyse en cours...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      Analyser
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Documents Tab */}
      {activeTab === 'documents' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Analyses de documents</h3>
            <div className="flex items-center gap-2">
              <Input placeholder="Rechercher..." className="w-64" />
              <Select
                placeholder="Type"
                options={[
                  { value: 'all', label: 'Tous' },
                  { value: 'contract', label: 'Contrats' },
                  { value: 'email', label: 'Emails' },
                  { value: 'feedback', label: 'Feedback' },
                  { value: 'report', label: 'Rapports' },
                ]}
              />
              <Select
                placeholder="Sentiment"
                options={[
                  { value: 'all', label: 'Tous' },
                  { value: 'positive', label: 'Positif' },
                  { value: 'negative', label: 'Négatif' },
                  { value: 'neutral', label: 'Neutre' },
                ]}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {documentAnalyses.map((document) => (
              <Card key={document.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getDocumentTypeIcon(document.documentType)}
                    <div>
                      <h4 className="font-semibold mb-1">{document.documentName}</h4>
                      <p className="text-sm text-muted-foreground">
                        {document.language.toUpperCase()} • {formatDate(document.processedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getSentimentBadge(document.sentiment.overall)}
                    <Badge variant="info" className="text-xs">
                      {document.confidence}% confiance
                    </Badge>
                  </div>
                </div>

                <p className="text-sm mb-4 line-clamp-3">{document.summary}</p>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-lg font-bold">{document.sentiment.score.toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">Score sentiment</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-lg font-bold">{document.readabilityScore}</div>
                    <div className="text-xs text-muted-foreground">Lisibilité</div>
                  </div>
                </div>

                {document.keywords.length > 0 && (
                  <div className="mb-4">
                    <div className="text-sm font-medium mb-2">Mots-clés principaux:</div>
                    <div className="flex flex-wrap gap-1">
                      {document.keywords.slice(0, 3).map((keyword, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {keyword.text}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {document.entities.length > 0 && (
                  <div className="mb-4">
                    <div className="text-sm font-medium mb-2">Entités détectées:</div>
                    <div className="flex flex-wrap gap-1">
                      {document.entities.slice(0, 3).map((entity, index) => (
                        <div key={index} className="flex items-center gap-1">
                          {getEntityBadge(entity.label)}
                          <span className="text-xs">{entity.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDocument(document)}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Détails
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Download className="h-3 w-3 mr-1" />
                    Export
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Intelligent Search Tab */}
      {activeTab === 'search' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Recherche intelligente</h3>
          </div>

          {/* Search Interface */}
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Search className="h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Posez votre question en langage naturel..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button>
                  <Brain className="h-4 w-4 mr-2" />
                  Rechercher
                </Button>
              </div>
              
              <div className="text-sm text-muted-foreground">
                Exemples: "Quels clients sont insatisfaits ?", "Montrez-moi les contrats expirés", "Analyse des ventes du mois dernier"
              </div>
            </div>
          </Card>

          {/* Search History */}
          <Card className="p-6">
            <h4 className="font-semibold mb-4">Recherches récentes</h4>
            <div className="space-y-3">
              {intelligentSearches.map((search) => (
                <div key={search.id} className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="font-medium mb-1">{search.query}</div>
                      <div className="text-sm text-muted-foreground">
                        Intent: {search.intent} • {formatDate(search.timestamp)}
                      </div>
                    </div>
                    <Badge variant="info">{search.results.length} résultats</Badge>
                  </div>
                  
                  {search.entities.length > 0 && (
                    <div className="mb-2">
                      <div className="text-sm font-medium mb-1">Entités détectées:</div>
                      <div className="flex flex-wrap gap-1">
                        {search.entities.map((entity, index) => (
                          <div key={index} className="flex items-center gap-1">
                            {getEntityBadge(entity.label)}
                            <span className="text-xs">{entity.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {search.suggestions.length > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-1">Suggestions:</div>
                      <div className="flex flex-wrap gap-1">
                        {search.suggestions.map((suggestion, index) => (
                          <Badge key={index} variant="outline" className="text-xs cursor-pointer hover:bg-muted">
                            {suggestion}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Document Details Dialog */}
      {selectedDocument && (
        <Dialog
          isOpen={showDocumentDialog}
          onClose={() => setShowDocumentDialog(false)}
          title="Analyse détaillée du document"
          size="lg"
        >
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Nom du document</label>
                <p className="mt-1">{selectedDocument.documentName}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Type</label>
                <div className="flex items-center gap-2 mt-1">
                  {getDocumentTypeIcon(selectedDocument.documentType)}
                  <span className="capitalize">{selectedDocument.documentType}</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Langue</label>
                <p className="mt-1">{selectedDocument.language.toUpperCase()}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Confiance</label>
                <p className="mt-1">{selectedDocument.confidence}%</p>
              </div>
            </div>

            {/* Sentiment Analysis */}
            <div>
              <label className="text-sm font-medium mb-3 block">Analyse du sentiment</label>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    {getSentimentIcon(selectedDocument.sentiment.overall)}
                    <span className="font-medium capitalize">{selectedDocument.sentiment.overall}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Score: {selectedDocument.sentiment.score.toFixed(2)} • Confiance: {selectedDocument.sentiment.confidence}%
                  </div>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="text-sm font-medium mb-2">Émotions détectées:</div>
                  <div className="space-y-1 text-xs">
                    <div>Joie: {(selectedDocument.sentiment.emotions.joy * 100).toFixed(0)}%</div>
                    <div>Colère: {(selectedDocument.sentiment.emotions.anger * 100).toFixed(0)}%</div>
                    <div>Peur: {(selectedDocument.sentiment.emotions.fear * 100).toFixed(0)}%</div>
                    <div>Tristesse: {(selectedDocument.sentiment.emotions.sadness * 100).toFixed(0)}%</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div>
              <label className="text-sm font-medium">Résumé automatique</label>
              <p className="mt-1 text-sm p-3 bg-muted/50 rounded-lg">{selectedDocument.summary}</p>
            </div>

            {/* Keywords */}
            {selectedDocument.keywords.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-3 block">Mots-clés extraits</label>
                <div className="space-y-2">
                  {selectedDocument.keywords.map((keyword, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                      <div>
                        <span className="font-medium">{keyword.text}</span>
                        {keyword.category && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            {keyword.category}
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Pertinence: {(keyword.relevance * 100).toFixed(0)}% • Fréquence: {keyword.frequency}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Named Entities */}
            {selectedDocument.entities.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-3 block">Entités nommées</label>
                <div className="space-y-2">
                  {selectedDocument.entities.map((entity, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                      <div className="flex items-center gap-2">
                        {getEntityBadge(entity.label)}
                        <span className="font-medium">{entity.text}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Confiance: {entity.confidence}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Topics */}
            {selectedDocument.topics.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-3 block">Sujets identifiés</label>
                <div className="space-y-2">
                  {selectedDocument.topics.map((topic, index) => (
                    <div key={index} className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{topic.name}</span>
                        <Badge variant="info">{(topic.confidence * 100).toFixed(0)}% confiance</Badge>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {topic.keywords.map((keyword, kidx) => (
                          <Badge key={kidx} variant="outline" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Content Preview */}
            <div>
              <label className="text-sm font-medium">Contenu du document</label>
              <div className="mt-1 p-3 bg-muted/50 rounded-lg max-h-32 overflow-y-auto text-sm">
                {selectedDocument.content}
              </div>
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <label className="font-medium">Score de lisibilité</label>
                <p>{selectedDocument.readabilityScore}/100</p>
              </div>
              <div>
                <label className="font-medium">Date de traitement</label>
                <p>{formatDate(selectedDocument.processedAt)}</p>
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  )
}
