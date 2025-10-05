// Computer Vision Component

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Camera, Image, Eye, Scan, Target, Layers, Zap,
  Upload, Download, RefreshCw, Play, Pause, Square,
  Settings, BarChart3, TrendingUp, CheckCircle, AlertTriangle,
  FileImage, Video, Monitor, Cpu, Database, Cloud
} from 'lucide-react';

interface VisionModel {
  id: string;
  name: string;
  type: 'classification' | 'detection' | 'segmentation' | 'ocr' | 'face_recognition' | 'quality_control';
  description: string;
  accuracy: number;
  inferenceTime: number;
  status: 'active' | 'training' | 'inactive';
  supportedFormats: string[];
  lastUpdated: string;
  usage: {
    imagesProcessed: number;
    successRate: number;
    avgConfidence: number;
  };
}

interface ImageAnalysis {
  id: string;
  imageUrl: string;
  imageName: string;
  modelId: string;
  results: {
    classification?: {
      category: string;
      confidence: number;
      allCategories: { category: string; confidence: number }[];
    };
    detection?: {
      objects: DetectedObject[];
      totalObjects: number;
    };
    segmentation?: {
      masks: SegmentationMask[];
      classes: string[];
    };
    ocr?: {
      text: string;
      confidence: number;
      boundingBoxes: TextBoundingBox[];
    };
    faceRecognition?: {
      faces: DetectedFace[];
      totalFaces: number;
    };
    qualityControl?: {
      score: number;
      defects: QualityDefect[];
      passed: boolean;
    };
  };
  processingTime: number;
  timestamp: string;
}

interface DetectedObject {
  class: string;
  confidence: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface SegmentationMask {
  class: string;
  confidence: number;
  mask: number[][];
  color: string;
}

interface TextBoundingBox {
  text: string;
  confidence: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface DetectedFace {
  confidence: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  attributes: {
    age?: number;
    gender?: string;
    emotion?: string;
  };
  identity?: {
    name: string;
    confidence: number;
  };
}

interface QualityDefect {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  location: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

const ComputerVision: React.FC = () => {
  const [activeTab, setActiveTab] = useState('analysis');
  const [models, setModels] = useState<VisionModel[]>([]);
  const [analyses, setAnalyses] = useState<ImageAnalysis[]>([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock vision models
  const mockModels: VisionModel[] = [
    {
      id: 'product_classifier',
      name: 'Classification de Produits',
      type: 'classification',
      description: 'Classification automatique des images de produits par catégorie',
      accuracy: 96.8,
      inferenceTime: 85,
      status: 'active',
      supportedFormats: ['jpg', 'jpeg', 'png', 'webp'],
      lastUpdated: '2024-12-18T14:30:00Z',
      usage: {
        imagesProcessed: 25430,
        successRate: 98.2,
        avgConfidence: 94.5
      }
    },
    {
      id: 'object_detector',
      name: 'Détection d\'Objets',
      type: 'detection',
      description: 'Détection et localisation d\'objets multiples dans les images',
      accuracy: 92.4,
      inferenceTime: 150,
      status: 'active',
      supportedFormats: ['jpg', 'jpeg', 'png'],
      lastUpdated: '2024-12-15T10:20:00Z',
      usage: {
        imagesProcessed: 18750,
        successRate: 95.8,
        avgConfidence: 89.2
      }
    },
    {
      id: 'document_ocr',
      name: 'OCR Documents',
      type: 'ocr',
      description: 'Extraction de texte à partir d\'images de documents',
      accuracy: 94.1,
      inferenceTime: 220,
      status: 'active',
      supportedFormats: ['jpg', 'jpeg', 'png', 'pdf'],
      lastUpdated: '2024-12-12T16:45:00Z',
      usage: {
        imagesProcessed: 12340,
        successRate: 97.5,
        avgConfidence: 91.8
      }
    },
    {
      id: 'quality_inspector',
      name: 'Contrôle Qualité',
      type: 'quality_control',
      description: 'Inspection automatique de la qualité des produits manufacturés',
      accuracy: 98.5,
      inferenceTime: 180,
      status: 'active',
      supportedFormats: ['jpg', 'jpeg', 'png'],
      lastUpdated: '2024-12-20T09:15:00Z',
      usage: {
        imagesProcessed: 8920,
        successRate: 99.1,
        avgConfidence: 96.7
      }
    },
    {
      id: 'face_recognizer',
      name: 'Reconnaissance Faciale',
      type: 'face_recognition',
      description: 'Détection et reconnaissance de visages pour la sécurité',
      accuracy: 97.2,
      inferenceTime: 120,
      status: 'active',
      supportedFormats: ['jpg', 'jpeg', 'png'],
      lastUpdated: '2024-12-10T11:30:00Z',
      usage: {
        imagesProcessed: 5670,
        successRate: 96.4,
        avgConfidence: 93.1
      }
    }
  ];

  // Mock analyses
  const mockAnalyses: ImageAnalysis[] = [
    {
      id: 'analysis_1',
      imageUrl: '/images/product_sample.jpg',
      imageName: 'product_sample.jpg',
      modelId: 'product_classifier',
      results: {
        classification: {
          category: 'Électronique - Smartphone',
          confidence: 0.96,
          allCategories: [
            { category: 'Électronique - Smartphone', confidence: 0.96 },
            { category: 'Électronique - Tablette', confidence: 0.03 },
            { category: 'Accessoires', confidence: 0.01 }
          ]
        }
      },
      processingTime: 85,
      timestamp: '2024-12-20T14:30:00Z'
    },
    {
      id: 'analysis_2',
      imageUrl: '/images/warehouse_scene.jpg',
      imageName: 'warehouse_scene.jpg',
      modelId: 'object_detector',
      results: {
        detection: {
          objects: [
            {
              class: 'Carton',
              confidence: 0.94,
              boundingBox: { x: 120, y: 80, width: 150, height: 200 }
            },
            {
              class: 'Palette',
              confidence: 0.89,
              boundingBox: { x: 300, y: 250, width: 180, height: 120 }
            },
            {
              class: 'Chariot élévateur',
              confidence: 0.92,
              boundingBox: { x: 500, y: 180, width: 200, height: 180 }
            }
          ],
          totalObjects: 3
        }
      },
      processingTime: 150,
      timestamp: '2024-12-20T14:25:00Z'
    },
    {
      id: 'analysis_3',
      imageUrl: '/images/invoice_scan.jpg',
      imageName: 'invoice_scan.jpg',
      modelId: 'document_ocr',
      results: {
        ocr: {
          text: 'FACTURE N° 2024-001\nDate: 15/12/2024\nClient: ACME Corp\nMontant: 1,250.00 EUR',
          confidence: 0.94,
          boundingBoxes: [
            {
              text: 'FACTURE N° 2024-001',
              confidence: 0.98,
              boundingBox: { x: 50, y: 30, width: 200, height: 25 }
            },
            {
              text: 'Date: 15/12/2024',
              confidence: 0.96,
              boundingBox: { x: 50, y: 70, width: 150, height: 20 }
            }
          ]
        }
      },
      processingTime: 220,
      timestamp: '2024-12-20T14:20:00Z'
    }
  ];

  useEffect(() => {
    setModels(mockModels);
    setAnalyses(mockAnalyses);
    setSelectedModel(mockModels[0]?.id || '');
    setIsLoading(false);
  }, []);

  const getModelTypeIcon = (type: string) => {
    switch (type) {
      case 'classification': return <Target className="h-4 w-4" />;
      case 'detection': return <Scan className="h-4 w-4" />;
      case 'segmentation': return <Layers className="h-4 w-4" />;
      case 'ocr': return <FileImage className="h-4 w-4" />;
      case 'face_recognition': return <Eye className="h-4 w-4" />;
      case 'quality_control': return <CheckCircle className="h-4 w-4" />;
      default: return <Camera className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50';
      case 'training': return 'text-yellow-600 bg-yellow-50';
      case 'inactive': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async () => {
    if (!selectedImage || !selectedModel) return;

    setIsProcessing(true);
    
    // Simulate API call
    setTimeout(() => {
      const model = models.find(m => m.id === selectedModel);
      if (!model) return;

      const newAnalysis: ImageAnalysis = {
        id: `analysis_${Date.now()}`,
        imageUrl: imagePreview,
        imageName: selectedImage.name,
        modelId: selectedModel,
        results: {},
        processingTime: Math.floor(Math.random() * 300) + 50,
        timestamp: new Date().toISOString()
      };

      // Mock results based on model type
      switch (model.type) {
        case 'classification':
          const categories = ['Électronique', 'Vêtements', 'Mobilier', 'Alimentation', 'Livres'];
          const category = categories[Math.floor(Math.random() * categories.length)];
          newAnalysis.results.classification = {
            category,
            confidence: 0.8 + Math.random() * 0.2,
            allCategories: categories.map(cat => ({
              category: cat,
              confidence: cat === category ? 0.8 + Math.random() * 0.2 : Math.random() * 0.5
            }))
          };
          break;
        case 'detection':
          newAnalysis.results.detection = {
            objects: [
              {
                class: 'Objet détecté',
                confidence: 0.9,
                boundingBox: { x: 100, y: 100, width: 200, height: 150 }
              }
            ],
            totalObjects: 1
          };
          break;
        case 'ocr':
          newAnalysis.results.ocr = {
            text: 'Texte extrait de l\'image',
            confidence: 0.9,
            boundingBoxes: [
              {
                text: 'Texte extrait',
                confidence: 0.9,
                boundingBox: { x: 50, y: 50, width: 150, height: 30 }
              }
            ]
          };
          break;
      }

      setAnalyses(prev => [newAnalysis, ...prev]);
      setSelectedImage(null);
      setImagePreview('');
      setIsProcessing(false);
    }, 2000);
  };

  const renderModelCard = (model: VisionModel) => {
    return (
      <Card key={model.id} className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-blue-50">
                {getModelTypeIcon(model.type)}
              </div>
              <div>
                <CardTitle className="text-lg">{model.name}</CardTitle>
                <CardDescription className="text-sm">
                  {model.type.toUpperCase()} • {model.inferenceTime}ms
                </CardDescription>
              </div>
            </div>
            <Badge className={getStatusColor(model.status)}>
              {model.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">{model.description}</p>
            
            {/* Performance metrics */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">
                  {model.accuracy.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500">Précision</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">
                  {model.inferenceTime}ms
                </div>
                <div className="text-xs text-gray-500">Inférence</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">
                  {model.usage.avgConfidence.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500">Confiance</div>
              </div>
            </div>

            {/* Usage stats */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Images traitées:</span>
                <span>{model.usage.imagesProcessed.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Taux de succès:</span>
                <span>{model.usage.successRate.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Formats:</span>
                <span>{model.supportedFormats.join(', ')}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex space-x-2 pt-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-1"
                onClick={() => setSelectedModel(model.id)}
              >
                <Zap className="h-3 w-3 mr-1" />
                Utiliser
              </Button>
              <Button size="sm" variant="outline">
                <Settings className="h-3 w-3 mr-1" />
                Config
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderAnalysisResult = (analysis: ImageAnalysis) => {
    const model = models.find(m => m.id === analysis.modelId);
    
    return (
      <Card key={analysis.id} className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {model && getModelTypeIcon(model.type)}
              <CardTitle className="text-lg">{model?.name}</CardTitle>
            </div>
            <div className="text-sm text-gray-500">
              {analysis.processingTime}ms
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Image preview */}
            <div className="flex space-x-4">
              <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden">
                <img 
                  src={analysis.imageUrl} 
                  alt={analysis.imageName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-700 mb-1">Image:</div>
                <div className="text-sm text-gray-600">{analysis.imageName}</div>
              </div>
            </div>

            {/* Results */}
            <div className="space-y-3">
              {/* Classification */}
              {analysis.results.classification && (
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">Classification:</div>
                  <div className="flex items-center space-x-4 mb-2">
                    <Badge variant="outline">
                      {analysis.results.classification.category}
                    </Badge>
                    <div className="text-sm text-gray-600">
                      Confiance: {(analysis.results.classification.confidence * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="space-y-1">
                    {analysis.results.classification.allCategories.slice(0, 3).map((cat, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <span className="text-xs w-32">{cat.category}:</span>
                        <Progress value={cat.confidence * 100} className="flex-1 h-2" />
                        <span className="text-xs w-12">{(cat.confidence * 100).toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Object Detection */}
              {analysis.results.detection && (
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    Objets Détectés ({analysis.results.detection.totalObjects}):
                  </div>
                  <div className="space-y-2">
                    {analysis.results.detection.objects.map((obj, index) => (
                      <div key={index} className="bg-blue-50 p-2 rounded text-sm">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{obj.class}</span>
                          <span className="text-gray-600">{(obj.confidence * 100).toFixed(1)}%</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Position: ({obj.boundingBox.x}, {obj.boundingBox.y}) 
                          Taille: {obj.boundingBox.width}×{obj.boundingBox.height}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* OCR */}
              {analysis.results.ocr && (
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">Texte Extrait:</div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm whitespace-pre-wrap">{analysis.results.ocr.text}</div>
                    <div className="text-xs text-gray-500 mt-2">
                      Confiance: {(analysis.results.ocr.confidence * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Timestamp */}
            <div className="text-xs text-gray-500 pt-2 border-t">
              Analysé le {new Date(analysis.timestamp).toLocaleString('fr-FR')}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderOverviewStats = () => {
    const totalImages = models.reduce((sum, m) => sum + m.usage.imagesProcessed, 0);
    const avgAccuracy = models.reduce((sum, m) => sum + m.accuracy, 0) / models.length;
    const avgInferenceTime = models.reduce((sum, m) => sum + m.inferenceTime, 0) / models.length;
    const activeModels = models.filter(m => m.status === 'active').length;

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Images Traitées</p>
                <p className="text-2xl font-bold">{totalImages.toLocaleString()}</p>
              </div>
              <Image className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Précision Moyenne</p>
                <p className="text-2xl font-bold text-green-600">{avgAccuracy.toFixed(1)}%</p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Temps Inférence</p>
                <p className="text-2xl font-bold text-purple-600">{Math.round(avgInferenceTime)}ms</p>
              </div>
              <Cpu className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Modèles Actifs</p>
                <p className="text-2xl font-bold text-yellow-600">{activeModels}</p>
              </div>
              <Eye className="h-8 w-8 text-yellow-600" />
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
          <h1 className="text-3xl font-bold text-gray-900">Vision par Ordinateur</h1>
          <p className="text-gray-600">Analysez et comprenez les images avec l'IA</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button size="sm">
            <Camera className="h-4 w-4 mr-2" />
            Nouveau Modèle
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="analysis">Analyse</TabsTrigger>
          <TabsTrigger value="models">Modèles</TabsTrigger>
          <TabsTrigger value="batch">Traitement par Lot</TabsTrigger>
          <TabsTrigger value="analytics">Analyses</TabsTrigger>
        </TabsList>

        <TabsContent value="analysis" className="space-y-6">
          {/* Image upload */}
          <Card>
            <CardHeader>
              <CardTitle>Analyser une Image</CardTitle>
              <CardDescription>
                Téléchargez une image pour l'analyser avec nos modèles de vision
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="model-select">Modèle</Label>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un modèle" />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map(model => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Upload area */}
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                {imagePreview ? (
                  <div className="space-y-4">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="max-w-full max-h-64 mx-auto rounded-lg"
                    />
                    <p className="text-sm text-gray-600">{selectedImage?.name}</p>
                  </div>
                ) : (
                  <>
                    <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-lg font-medium text-gray-600">Glissez votre image ici</p>
                    <p className="text-sm text-gray-500 mb-4">ou cliquez pour sélectionner</p>
                  </>
                )}
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              
              <Button 
                onClick={processImage} 
                disabled={!selectedImage || !selectedModel || isProcessing}
                className="w-full"
              >
                {isProcessing ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Eye className="h-4 w-4 mr-2" />
                )}
                Analyser l'Image
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          <div className="space-y-4">
            {analyses.map(renderAnalysisResult)}
          </div>
        </TabsContent>

        <TabsContent value="models" className="space-y-6">
          {renderOverviewStats()}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {models.map(renderModelCard)}
          </div>
        </TabsContent>

        <TabsContent value="batch" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Traitement par Lot</CardTitle>
              <CardDescription>Traitez plusieurs images simultanément</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <Database className="h-12 w-12 mx-auto mb-4" />
                <p>Interface de traitement par lot en cours de développement</p>
                <p className="text-sm">Traitement parallèle de milliers d'images</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analyses de Performance</CardTitle>
              <CardDescription>Métriques et statistiques de vos modèles de vision</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                <p>Analyses détaillées en cours de développement</p>
                <p className="text-sm">Métriques de performance et comparaisons de modèles</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ComputerVision;
