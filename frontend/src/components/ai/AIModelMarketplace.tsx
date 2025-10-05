// AI Model Marketplace Component

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Store, Download, Upload, Star, Heart, Eye, Search,
  Filter, ShoppingCart, Package, Zap, Brain, Target,
  CheckCircle, AlertTriangle, Clock, Users, TrendingUp,
  BarChart3, Settings, RefreshCw, Globe, Shield, Award
} from 'lucide-react';

interface MarketplaceModel {
  id: string;
  name: string;
  description: string;
  category: 'nlp' | 'computer_vision' | 'forecasting' | 'classification' | 'recommendation' | 'optimization';
  subcategory: string;
  version: string;
  author: string;
  authorType: 'community' | 'verified' | 'enterprise' | 'official';
  price: {
    type: 'free' | 'paid' | 'subscription';
    amount?: number;
    currency?: string;
    period?: 'monthly' | 'yearly' | 'one_time';
  };
  rating: number;
  reviewCount: number;
  downloadCount: number;
  size: number;
  accuracy?: number;
  performance: {
    inferenceTime: number;
    memoryUsage: number;
    cpuUsage: number;
  };
  requirements: {
    minRam: number;
    minCpu: string;
    gpu?: boolean;
    frameworks: string[];
  };
  tags: string[];
  license: string;
  lastUpdated: string;
  createdAt: string;
  documentation: string;
  demoUrl?: string;
  isInstalled: boolean;
  isFavorite: boolean;
  compatibility: 'compatible' | 'partial' | 'incompatible';
}

interface ModelReview {
  id: string;
  modelId: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  pros: string[];
  cons: string[];
  timestamp: string;
  helpful: number;
  verified: boolean;
}

interface ModelCollection {
  id: string;
  name: string;
  description: string;
  models: string[];
  author: string;
  isPublic: boolean;
  followers: number;
  createdAt: string;
}

const AIModelMarketplace: React.FC = () => {
  const [activeTab, setActiveTab] = useState('browse');
  const [models, setModels] = useState<MarketplaceModel[]>([]);
  const [reviews, setReviews] = useState<ModelReview[]>([]);
  const [collections, setCollections] = useState<ModelCollection[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popularity');
  const [showModelDialog, setShowModelDialog] = useState(false);
  const [selectedModel, setSelectedModel] = useState<MarketplaceModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock marketplace models
  const mockModels: MarketplaceModel[] = [
    {
      id: 'sentiment_analyzer_pro',
      name: 'Sentiment Analyzer Pro',
      description: 'Analyseur de sentiment avancé avec support multilingue et détection d\'émotions fines',
      category: 'nlp',
      subcategory: 'Analyse de Sentiment',
      version: '2.1.0',
      author: 'AI Solutions Inc.',
      authorType: 'verified',
      price: {
        type: 'paid',
        amount: 49.99,
        currency: 'EUR',
        period: 'monthly'
      },
      rating: 4.8,
      reviewCount: 156,
      downloadCount: 12450,
      size: 245,
      accuracy: 94.2,
      performance: {
        inferenceTime: 85,
        memoryUsage: 512,
        cpuUsage: 15
      },
      requirements: {
        minRam: 4,
        minCpu: 'Intel i5 ou équivalent',
        gpu: false,
        frameworks: ['TensorFlow', 'PyTorch']
      },
      tags: ['sentiment', 'nlp', 'multilingue', 'émotions'],
      license: 'Commercial',
      lastUpdated: '2024-12-15T10:30:00Z',
      createdAt: '2024-06-20T14:00:00Z',
      documentation: 'Documentation complète avec exemples d\'API',
      demoUrl: 'https://demo.sentiment-pro.com',
      isInstalled: false,
      isFavorite: true,
      compatibility: 'compatible'
    },
    {
      id: 'object_detector_yolo',
      name: 'YOLO Object Detector v8',
      description: 'Détecteur d\'objets ultra-rapide basé sur YOLOv8 avec 80+ classes pré-entraînées',
      category: 'computer_vision',
      subcategory: 'Détection d\'Objets',
      version: '8.2.1',
      author: 'OpenCV Community',
      authorType: 'community',
      price: {
        type: 'free'
      },
      rating: 4.6,
      reviewCount: 89,
      downloadCount: 8920,
      size: 512,
      accuracy: 91.5,
      performance: {
        inferenceTime: 45,
        memoryUsage: 1024,
        cpuUsage: 25
      },
      requirements: {
        minRam: 8,
        minCpu: 'Intel i7 ou équivalent',
        gpu: true,
        frameworks: ['PyTorch', 'ONNX']
      },
      tags: ['yolo', 'détection', 'temps-réel', 'objets'],
      license: 'MIT',
      lastUpdated: '2024-12-18T16:45:00Z',
      createdAt: '2024-09-10T09:00:00Z',
      documentation: 'Guide d\'installation et d\'utilisation détaillé',
      demoUrl: 'https://yolo-demo.opencv.org',
      isInstalled: true,
      isFavorite: false,
      compatibility: 'compatible'
    },
    {
      id: 'sales_forecaster_enterprise',
      name: 'Enterprise Sales Forecaster',
      description: 'Modèle de prévision des ventes avec IA explicable et intégration ERP native',
      category: 'forecasting',
      subcategory: 'Prévision des Ventes',
      version: '1.5.2',
      author: 'ERP AI Labs',
      authorType: 'official',
      price: {
        type: 'subscription',
        amount: 199.99,
        currency: 'EUR',
        period: 'monthly'
      },
      rating: 4.9,
      reviewCount: 234,
      downloadCount: 5670,
      size: 128,
      accuracy: 96.8,
      performance: {
        inferenceTime: 120,
        memoryUsage: 256,
        cpuUsage: 10
      },
      requirements: {
        minRam: 2,
        minCpu: 'Intel i3 ou équivalent',
        gpu: false,
        frameworks: ['Scikit-learn', 'XGBoost']
      },
      tags: ['ventes', 'prévision', 'erp', 'explicable'],
      license: 'Enterprise',
      lastUpdated: '2024-12-20T08:15:00Z',
      createdAt: '2024-03-15T11:30:00Z',
      documentation: 'Documentation enterprise avec support technique',
      isInstalled: false,
      isFavorite: true,
      compatibility: 'compatible'
    },
    {
      id: 'recommendation_engine',
      name: 'Smart Recommendation Engine',
      description: 'Moteur de recommandation hybride avec apprentissage collaboratif et basé sur le contenu',
      category: 'recommendation',
      subcategory: 'Recommandations Produits',
      version: '3.0.1',
      author: 'RecommendAI',
      authorType: 'enterprise',
      price: {
        type: 'paid',
        amount: 299.99,
        currency: 'EUR',
        period: 'one_time'
      },
      rating: 4.7,
      reviewCount: 67,
      downloadCount: 3450,
      size: 89,
      accuracy: 88.9,
      performance: {
        inferenceTime: 35,
        memoryUsage: 512,
        cpuUsage: 20
      },
      requirements: {
        minRam: 4,
        minCpu: 'Intel i5 ou équivalent',
        gpu: false,
        frameworks: ['TensorFlow', 'Surprise']
      },
      tags: ['recommandation', 'collaboratif', 'hybride', 'e-commerce'],
      license: 'Commercial',
      lastUpdated: '2024-12-12T14:20:00Z',
      createdAt: '2024-08-05T16:00:00Z',
      documentation: 'Guide d\'intégration avec exemples de code',
      demoUrl: 'https://demo.recommendai.com',
      isInstalled: false,
      isFavorite: false,
      compatibility: 'compatible'
    },
    {
      id: 'quality_inspector_vision',
      name: 'Industrial Quality Inspector',
      description: 'Système de contrôle qualité par vision industrielle avec détection de défauts',
      category: 'computer_vision',
      subcategory: 'Contrôle Qualité',
      version: '2.3.0',
      author: 'IndustryVision Corp',
      authorType: 'verified',
      price: {
        type: 'subscription',
        amount: 499.99,
        currency: 'EUR',
        period: 'monthly'
      },
      rating: 4.5,
      reviewCount: 45,
      downloadCount: 1890,
      size: 756,
      accuracy: 98.5,
      performance: {
        inferenceTime: 200,
        memoryUsage: 2048,
        cpuUsage: 35
      },
      requirements: {
        minRam: 16,
        minCpu: 'Intel i9 ou équivalent',
        gpu: true,
        frameworks: ['TensorFlow', 'OpenCV']
      },
      tags: ['qualité', 'industrie', 'défauts', 'vision'],
      license: 'Enterprise',
      lastUpdated: '2024-12-10T12:00:00Z',
      createdAt: '2024-07-22T10:30:00Z',
      documentation: 'Manuel d\'installation industrielle',
      isInstalled: false,
      isFavorite: false,
      compatibility: 'partial'
    }
  ];

  // Mock reviews
  const mockReviews: ModelReview[] = [
    {
      id: 'review_1',
      modelId: 'sentiment_analyzer_pro',
      userId: 'user_123',
      userName: 'Marie Dubois',
      rating: 5,
      title: 'Excellent pour notre service client',
      comment: 'Nous utilisons ce modèle depuis 6 mois pour analyser les retours clients. La précision est remarquable et le support multilingue est parfait pour notre clientèle internationale.',
      pros: ['Très précis', 'Support multilingue', 'API simple', 'Documentation claire'],
      cons: ['Prix un peu élevé'],
      timestamp: '2024-12-18T14:30:00Z',
      helpful: 23,
      verified: true
    },
    {
      id: 'review_2',
      modelId: 'object_detector_yolo',
      userId: 'user_456',
      userName: 'Ahmed Benali',
      rating: 4,
      title: 'Performant mais gourmand en ressources',
      comment: 'Très bon modèle pour la détection en temps réel. Les performances sont excellentes mais il faut une bonne carte graphique.',
      pros: ['Très rapide', 'Bonne précision', 'Gratuit', 'Bien documenté'],
      cons: ['Nécessite GPU', 'Consommation mémoire élevée'],
      timestamp: '2024-12-15T09:20:00Z',
      helpful: 18,
      verified: true
    }
  ];

  // Mock collections
  const mockCollections: ModelCollection[] = [
    {
      id: 'collection_nlp',
      name: 'NLP Essentials',
      description: 'Collection de modèles NLP indispensables pour l\'analyse de texte',
      models: ['sentiment_analyzer_pro'],
      author: 'AI Expert',
      isPublic: true,
      followers: 1250,
      createdAt: '2024-11-15T10:00:00Z'
    },
    {
      id: 'collection_vision',
      name: 'Computer Vision Toolkit',
      description: 'Outils de vision par ordinateur pour l\'industrie',
      models: ['object_detector_yolo', 'quality_inspector_vision'],
      author: 'VisionPro',
      isPublic: true,
      followers: 890,
      createdAt: '2024-10-20T14:30:00Z'
    }
  ];

  useEffect(() => {
    setModels(mockModels);
    setReviews(mockReviews);
    setCollections(mockCollections);
    setIsLoading(false);
  }, []);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'nlp': return <Brain className="h-4 w-4" />;
      case 'computer_vision': return <Eye className="h-4 w-4" />;
      case 'forecasting': return <TrendingUp className="h-4 w-4" />;
      case 'classification': return <Target className="h-4 w-4" />;
      case 'recommendation': return <Heart className="h-4 w-4" />;
      case 'optimization': return <Zap className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const getAuthorBadge = (authorType: string) => {
    switch (authorType) {
      case 'official': return <Badge className="text-blue-600 bg-blue-50">Officiel</Badge>;
      case 'verified': return <Badge className="text-green-600 bg-green-50">Vérifié</Badge>;
      case 'enterprise': return <Badge className="text-purple-600 bg-purple-50">Enterprise</Badge>;
      case 'community': return <Badge className="text-gray-600 bg-gray-50">Communauté</Badge>;
      default: return null;
    }
  };

  const getCompatibilityColor = (compatibility: string) => {
    switch (compatibility) {
      case 'compatible': return 'text-green-600 bg-green-50';
      case 'partial': return 'text-yellow-600 bg-yellow-50';
      case 'incompatible': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatPrice = (price: MarketplaceModel['price']) => {
    if (price.type === 'free') return 'Gratuit';
    if (price.type === 'paid' || price.type === 'subscription') {
      const periodText = price.period === 'monthly' ? '/mois' :
                        price.period === 'yearly' ? '/an' : '';
      return `${price.amount}€${periodText}`;
    }
    return 'N/A';
  };

  const filteredModels = models.filter(model => {
    const matchesSearch = model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         model.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         model.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || model.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedModels = [...filteredModels].sort((a, b) => {
    switch (sortBy) {
      case 'popularity': return b.downloadCount - a.downloadCount;
      case 'rating': return b.rating - a.rating;
      case 'newest': return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'price_low': return (a.price.amount || 0) - (b.price.amount || 0);
      case 'price_high': return (b.price.amount || 0) - (a.price.amount || 0);
      default: return 0;
    }
  });

  const renderModelCard = (model: MarketplaceModel) => {
    return (
      <Card key={model.id} className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => { setSelectedModel(model); setShowModelDialog(true); }}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-blue-50">
                {getCategoryIcon(model.category)}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <CardTitle className="text-lg">{model.name}</CardTitle>
                  {model.isFavorite && <Heart className="h-4 w-4 text-red-500 fill-current" />}
                </div>
                <CardDescription className="text-sm">
                  v{model.version} • {model.author}
                </CardDescription>
              </div>
            </div>
            <div className="flex flex-col items-end space-y-1">
              {getAuthorBadge(model.authorType)}
              <Badge className={getCompatibilityColor(model.compatibility)}>
                {model.compatibility}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600 line-clamp-2">{model.description}</p>
            
            {/* Rating and stats */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-3 w-3 ${
                          i < Math.floor(model.rating) ? 'text-yellow-500 fill-current' : 'text-gray-300'
                        }`} 
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-600">({model.reviewCount})</span>
                </div>
                <div className="text-xs text-gray-500">
                  {model.downloadCount.toLocaleString()} téléchargements
                </div>
              </div>
              <div className="text-sm font-medium text-blue-600">
                {formatPrice(model.price)}
              </div>
            </div>

            {/* Performance metrics */}
            {model.accuracy && (
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center">
                  <div className="font-medium text-green-600">{model.accuracy.toFixed(1)}%</div>
                  <div className="text-gray-500">Précision</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-blue-600">{model.performance.inferenceTime}ms</div>
                  <div className="text-gray-500">Inférence</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-purple-600">{model.size}MB</div>
                  <div className="text-gray-500">Taille</div>
                </div>
              </div>
            )}

            {/* Tags */}
            <div className="flex flex-wrap gap-1">
              {model.tags.slice(0, 3).map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {model.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{model.tags.length - 3}
                </Badge>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex space-x-2 pt-2">
              {model.isInstalled ? (
                <Button size="sm" variant="outline" className="flex-1">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Installé
                </Button>
              ) : (
                <Button size="sm" className="flex-1">
                  <Download className="h-3 w-3 mr-1" />
                  Installer
                </Button>
              )}
              <Button size="sm" variant="outline">
                <Eye className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="outline">
                <Heart className={`h-3 w-3 ${model.isFavorite ? 'text-red-500 fill-current' : ''}`} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderModelDialog = () => {
    if (!selectedModel) return null;

    const modelReviews = reviews.filter(r => r.modelId === selectedModel.id);

    return (
      <Dialog open={showModelDialog} onOpenChange={setShowModelDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-blue-50">
                {getCategoryIcon(selectedModel.category)}
              </div>
              <div>
                <DialogTitle className="text-2xl">{selectedModel.name}</DialogTitle>
                <DialogDescription>
                  v{selectedModel.version} par {selectedModel.author}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <h3 className="text-lg font-medium mb-3">Description</h3>
                <p className="text-gray-600 mb-4">{selectedModel.description}</p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Catégorie:</span>
                    <div className="capitalize">{selectedModel.category}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Licence:</span>
                    <div>{selectedModel.license}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Taille:</span>
                    <div>{selectedModel.size} MB</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Dernière MAJ:</span>
                    <div>{new Date(selectedModel.lastUpdated).toLocaleDateString('fr-FR')}</div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatPrice(selectedModel.price)}
                  </div>
                  <div className="text-sm text-gray-500 mb-3">Prix</div>
                  {selectedModel.isInstalled ? (
                    <Button className="w-full" disabled>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Installé
                    </Button>
                  ) : (
                    <Button className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Installer
                    </Button>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Note:</span>
                    <div className="flex items-center space-x-1">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-3 w-3 ${
                              i < Math.floor(selectedModel.rating) ? 'text-yellow-500 fill-current' : 'text-gray-300'
                            }`} 
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        {selectedModel.rating.toFixed(1)} ({selectedModel.reviewCount})
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Téléchargements:</span>
                    <span>{selectedModel.downloadCount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Compatibilité:</span>
                    <Badge className={getCompatibilityColor(selectedModel.compatibility)}>
                      {selectedModel.compatibility}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance */}
            <div>
              <h3 className="text-lg font-medium mb-3">Performance</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {selectedModel.accuracy && (
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-xl font-bold text-green-600">
                      {selectedModel.accuracy.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Précision</div>
                  </div>
                )}
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-xl font-bold text-blue-600">
                    {selectedModel.performance.inferenceTime}ms
                  </div>
                  <div className="text-sm text-gray-600">Temps d'inférence</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-xl font-bold text-purple-600">
                    {selectedModel.performance.memoryUsage}MB
                  </div>
                  <div className="text-sm text-gray-600">Mémoire</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-xl font-bold text-orange-600">
                    {selectedModel.performance.cpuUsage}%
                  </div>
                  <div className="text-sm text-gray-600">CPU</div>
                </div>
              </div>
            </div>

            {/* Requirements */}
            <div>
              <h3 className="text-lg font-medium mb-3">Prérequis</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">RAM minimum:</span>
                  <div>{selectedModel.requirements.minRam} GB</div>
                </div>
                <div>
                  <span className="text-gray-600">CPU minimum:</span>
                  <div>{selectedModel.requirements.minCpu}</div>
                </div>
                <div>
                  <span className="text-gray-600">GPU requis:</span>
                  <div>{selectedModel.requirements.gpu ? 'Oui' : 'Non'}</div>
                </div>
                <div>
                  <span className="text-gray-600">Frameworks:</span>
                  <div>{selectedModel.requirements.frameworks.join(', ')}</div>
                </div>
              </div>
            </div>

            {/* Reviews */}
            {modelReviews.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-3">Avis ({modelReviews.length})</h3>
                <div className="space-y-4">
                  {modelReviews.map(review => (
                    <div key={review.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{review.userName}</span>
                          {review.verified && (
                            <Badge className="text-green-600 bg-green-50">Vérifié</Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`h-3 w-3 ${
                                  i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                                }`} 
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(review.timestamp).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </div>
                      <h4 className="font-medium mb-2">{review.title}</h4>
                      <p className="text-sm text-gray-600 mb-3">{review.comment}</p>
                      
                      {(review.pros.length > 0 || review.cons.length > 0) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          {review.pros.length > 0 && (
                            <div>
                              <div className="text-green-600 font-medium mb-1">Points positifs:</div>
                              <ul className="text-gray-600 space-y-1">
                                {review.pros.map((pro, index) => (
                                  <li key={index} className="flex items-start space-x-1">
                                    <span className="text-green-500">+</span>
                                    <span>{pro}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {review.cons.length > 0 && (
                            <div>
                              <div className="text-red-600 font-medium mb-1">Points négatifs:</div>
                              <ul className="text-gray-600 space-y-1">
                                {review.cons.map((con, index) => (
                                  <li key={index} className="flex items-start space-x-1">
                                    <span className="text-red-500">-</span>
                                    <span>{con}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mt-3 pt-3 border-t">
                        <span className="text-xs text-gray-500">
                          {review.helpful} personnes ont trouvé cet avis utile
                        </span>
                        <Button size="sm" variant="outline">
                          Utile
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const renderOverviewStats = () => {
    const totalModels = models.length;
    const freeModels = models.filter(m => m.price.type === 'free').length;
    const avgRating = models.reduce((sum, m) => sum + m.rating, 0) / models.length;
    const totalDownloads = models.reduce((sum, m) => sum + m.downloadCount, 0);

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Modèles Disponibles</p>
                <p className="text-2xl font-bold">{totalModels}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Modèles Gratuits</p>
                <p className="text-2xl font-bold text-green-600">{freeModels}</p>
              </div>
              <Heart className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Note Moyenne</p>
                <p className="text-2xl font-bold text-yellow-600">{avgRating.toFixed(1)}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Téléchargements</p>
                <p className="text-2xl font-bold text-purple-600">{totalDownloads.toLocaleString()}</p>
              </div>
              <Download className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Marketplace IA</h1>
          <p className="text-gray-600">Découvrez et installez des modèles IA prêts à l'emploi</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Publier
          </Button>
          <Button size="sm">
            <Store className="h-4 w-4 mr-2" />
            Ma Bibliothèque
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="browse">Parcourir</TabsTrigger>
          <TabsTrigger value="installed">Installés</TabsTrigger>
          <TabsTrigger value="collections">Collections</TabsTrigger>
          <TabsTrigger value="analytics">Analyses</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-6">
          {renderOverviewStats()}
          
          {/* Filters */}
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher des modèles..."
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                <SelectItem value="nlp">NLP</SelectItem>
                <SelectItem value="computer_vision">Vision par Ordinateur</SelectItem>
                <SelectItem value="forecasting">Prévision</SelectItem>
                <SelectItem value="classification">Classification</SelectItem>
                <SelectItem value="recommendation">Recommandation</SelectItem>
                <SelectItem value="optimization">Optimisation</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popularity">Popularité</SelectItem>
                <SelectItem value="rating">Note</SelectItem>
                <SelectItem value="newest">Plus récent</SelectItem>
                <SelectItem value="price_low">Prix croissant</SelectItem>
                <SelectItem value="price_high">Prix décroissant</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Models grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedModels.map(renderModelCard)}
          </div>
        </TabsContent>

        <TabsContent value="installed" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {models.filter(m => m.isInstalled).map(renderModelCard)}
          </div>
        </TabsContent>

        <TabsContent value="collections" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map(collection => (
              <Card key={collection.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{collection.name}</CardTitle>
                  <CardDescription>{collection.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Modèles:</span>
                      <span>{collection.models.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Auteur:</span>
                      <span>{collection.author}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Abonnés:</span>
                      <span>{collection.followers.toLocaleString()}</span>
                    </div>
                    <Button size="sm" className="w-full">
                      <Eye className="h-3 w-3 mr-1" />
                      Voir la Collection
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analyses du Marketplace</CardTitle>
              <CardDescription>Statistiques d'utilisation et tendances</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                <p>Analyses détaillées en cours de développement</p>
                <p className="text-sm">Métriques d'adoption et recommandations personnalisées</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {renderModelDialog()}
    </div>
  );
};

export default AIModelMarketplace;
