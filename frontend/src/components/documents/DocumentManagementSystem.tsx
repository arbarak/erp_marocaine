// Document Management System Component

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
  FileText, Upload, Download, Search, Filter, Eye, Edit, Trash2,
  Folder, FolderOpen, Star, Share2, Lock, Unlock, Clock,
  Tag, User, Calendar, FileImage, FileVideo, FilePdf,
  Archive, RotateCcw, Copy, Move, Plus, Settings
} from 'lucide-react';

interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'video' | 'document' | 'spreadsheet' | 'presentation';
  size: number;
  mimeType: string;
  url: string;
  thumbnailUrl?: string;
  folderId?: string;
  tags: string[];
  description: string;
  version: string;
  status: 'draft' | 'review' | 'approved' | 'archived';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastModifiedBy: string;
  permissions: {
    read: string[];
    write: string[];
    admin: string[];
  };
  metadata: {
    [key: string]: any;
  };
  isStarred: boolean;
  isLocked: boolean;
  downloadCount: number;
  viewCount: number;
}

interface Folder {
  id: string;
  name: string;
  description: string;
  parentId?: string;
  path: string;
  createdAt: string;
  createdBy: string;
  permissions: {
    read: string[];
    write: string[];
    admin: string[];
  };
  documentCount: number;
  subfolderCount: number;
}

interface DocumentVersion {
  id: string;
  documentId: string;
  version: string;
  size: number;
  url: string;
  createdAt: string;
  createdBy: string;
  comment: string;
  isCurrent: boolean;
}

const DocumentManagementSystem: React.FC = () => {
  const [activeTab, setActiveTab] = useState('documents');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string>('');
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Mock documents data
  const mockDocuments: Document[] = [
    {
      id: 'doc_1',
      name: 'Contrat_Client_ACME_2024.pdf',
      type: 'pdf',
      size: 2048576,
      mimeType: 'application/pdf',
      url: '/documents/contrat_acme.pdf',
      thumbnailUrl: '/thumbnails/contrat_acme.jpg',
      folderId: 'folder_contracts',
      tags: ['contrat', 'client', 'acme', '2024'],
      description: 'Contrat commercial avec ACME Corp pour l\'année 2024',
      version: '1.2',
      status: 'approved',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-02-10T14:30:00Z',
      createdBy: 'commercial@company.com',
      lastModifiedBy: 'legal@company.com',
      permissions: {
        read: ['all'],
        write: ['commercial@company.com', 'legal@company.com'],
        admin: ['admin@company.com']
      },
      metadata: {
        client: 'ACME Corp',
        amount: 150000,
        duration: '12 months',
        signedDate: '2024-01-20'
      },
      isStarred: true,
      isLocked: false,
      downloadCount: 15,
      viewCount: 45
    },
    {
      id: 'doc_2',
      name: 'Catalogue_Produits_2024.pdf',
      type: 'pdf',
      size: 8388608,
      mimeType: 'application/pdf',
      url: '/documents/catalogue_2024.pdf',
      thumbnailUrl: '/thumbnails/catalogue_2024.jpg',
      folderId: 'folder_marketing',
      tags: ['catalogue', 'produits', 'marketing', '2024'],
      description: 'Catalogue officiel des produits pour l\'année 2024',
      version: '3.0',
      status: 'approved',
      createdAt: '2024-03-01T09:00:00Z',
      updatedAt: '2024-11-15T16:20:00Z',
      createdBy: 'marketing@company.com',
      lastModifiedBy: 'design@company.com',
      permissions: {
        read: ['all'],
        write: ['marketing@company.com', 'design@company.com'],
        admin: ['admin@company.com']
      },
      metadata: {
        pages: 120,
        products: 450,
        language: 'fr'
      },
      isStarred: false,
      isLocked: true,
      downloadCount: 89,
      viewCount: 234
    },
    {
      id: 'doc_3',
      name: 'Rapport_Financier_Q4_2024.xlsx',
      type: 'spreadsheet',
      size: 1048576,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      url: '/documents/rapport_q4_2024.xlsx',
      folderId: 'folder_finance',
      tags: ['rapport', 'financier', 'q4', '2024'],
      description: 'Rapport financier détaillé pour le quatrième trimestre 2024',
      version: '1.0',
      status: 'review',
      createdAt: '2024-12-15T11:30:00Z',
      updatedAt: '2024-12-18T09:15:00Z',
      createdBy: 'finance@company.com',
      lastModifiedBy: 'comptable@company.com',
      permissions: {
        read: ['finance@company.com', 'direction@company.com'],
        write: ['finance@company.com'],
        admin: ['admin@company.com']
      },
      metadata: {
        period: 'Q4 2024',
        revenue: 2450000,
        profit: 368000
      },
      isStarred: true,
      isLocked: false,
      downloadCount: 3,
      viewCount: 12
    },
    {
      id: 'doc_4',
      name: 'Presentation_Produit_Innovation.pptx',
      type: 'presentation',
      size: 15728640,
      mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      url: '/documents/presentation_innovation.pptx',
      thumbnailUrl: '/thumbnails/presentation_innovation.jpg',
      folderId: 'folder_marketing',
      tags: ['présentation', 'innovation', 'produit'],
      description: 'Présentation des nouveaux produits innovants',
      version: '2.1',
      status: 'draft',
      createdAt: '2024-12-10T14:00:00Z',
      updatedAt: '2024-12-19T10:45:00Z',
      createdBy: 'innovation@company.com',
      lastModifiedBy: 'marketing@company.com',
      permissions: {
        read: ['innovation@company.com', 'marketing@company.com'],
        write: ['innovation@company.com', 'marketing@company.com'],
        admin: ['admin@company.com']
      },
      metadata: {
        slides: 25,
        theme: 'innovation'
      },
      isStarred: false,
      isLocked: false,
      downloadCount: 1,
      viewCount: 8
    }
  ];

  // Mock folders data
  const mockFolders: Folder[] = [
    {
      id: 'folder_contracts',
      name: 'Contrats',
      description: 'Documents contractuels et accords commerciaux',
      path: '/Contrats',
      createdAt: '2024-01-01T00:00:00Z',
      createdBy: 'admin@company.com',
      permissions: {
        read: ['all'],
        write: ['commercial@company.com', 'legal@company.com'],
        admin: ['admin@company.com']
      },
      documentCount: 25,
      subfolderCount: 3
    },
    {
      id: 'folder_marketing',
      name: 'Marketing',
      description: 'Supports marketing et communication',
      path: '/Marketing',
      createdAt: '2024-01-01T00:00:00Z',
      createdBy: 'admin@company.com',
      permissions: {
        read: ['all'],
        write: ['marketing@company.com', 'design@company.com'],
        admin: ['admin@company.com']
      },
      documentCount: 45,
      subfolderCount: 5
    },
    {
      id: 'folder_finance',
      name: 'Finance',
      description: 'Documents financiers et comptables',
      path: '/Finance',
      createdAt: '2024-01-01T00:00:00Z',
      createdBy: 'admin@company.com',
      permissions: {
        read: ['finance@company.com', 'direction@company.com'],
        write: ['finance@company.com'],
        admin: ['admin@company.com']
      },
      documentCount: 18,
      subfolderCount: 2
    },
    {
      id: 'folder_hr',
      name: 'Ressources Humaines',
      description: 'Documents RH et administratifs',
      path: '/RH',
      createdAt: '2024-01-01T00:00:00Z',
      createdBy: 'admin@company.com',
      permissions: {
        read: ['rh@company.com', 'direction@company.com'],
        write: ['rh@company.com'],
        admin: ['admin@company.com']
      },
      documentCount: 32,
      subfolderCount: 4
    }
  ];

  useEffect(() => {
    setDocuments(mockDocuments);
    setFolders(mockFolders);
    setIsLoading(false);
  }, []);

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FilePdf className="h-8 w-8 text-red-600" />;
      case 'image': return <FileImage className="h-8 w-8 text-green-600" />;
      case 'video': return <FileVideo className="h-8 w-8 text-purple-600" />;
      default: return <FileText className="h-8 w-8 text-blue-600" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-50';
      case 'review': return 'text-yellow-600 bg-yellow-50';
      case 'draft': return 'text-gray-600 bg-gray-50';
      case 'archived': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFolder = !currentFolder || doc.folderId === currentFolder;
    return matchesSearch && matchesFolder;
  });

  const renderDocumentCard = (document: Document) => {
    const isSelected = selectedDocuments.includes(document.id);
    
    return (
      <Card 
        key={document.id} 
        className={`cursor-pointer transition-all hover:shadow-md ${
          isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
        }`}
        onClick={() => {
          if (isSelected) {
            setSelectedDocuments(prev => prev.filter(id => id !== document.id));
          } else {
            setSelectedDocuments(prev => [...prev, document.id]);
          }
        }}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              {document.thumbnailUrl ? (
                <img 
                  src={document.thumbnailUrl} 
                  alt={document.name}
                  className="w-12 h-12 object-cover rounded"
                />
              ) : (
                getFileIcon(document.type)
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h3 className="font-medium text-sm truncate">{document.name}</h3>
                  {document.isStarred && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                  {document.isLocked && <Lock className="h-4 w-4 text-gray-500" />}
                </div>
                <p className="text-xs text-gray-500 mt-1">{formatFileSize(document.size)}</p>
              </div>
            </div>
            <Badge className={getStatusColor(document.status)}>
              {document.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            <p className="text-xs text-gray-600 line-clamp-2">{document.description}</p>
            
            {/* Tags */}
            <div className="flex flex-wrap gap-1">
              {document.tags.slice(0, 3).map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {document.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{document.tags.length - 3}
                </Badge>
              )}
            </div>
            
            {/* Metadata */}
            <div className="text-xs text-gray-500 space-y-1">
              <div className="flex justify-between">
                <span>Version:</span>
                <span>{document.version}</span>
              </div>
              <div className="flex justify-between">
                <span>Modifié:</span>
                <span>{new Date(document.updatedAt).toLocaleDateString('fr-FR')}</span>
              </div>
              <div className="flex justify-between">
                <span>Vues:</span>
                <span>{document.viewCount}</span>
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex space-x-1 pt-2">
              <Button size="sm" variant="outline" className="flex-1">
                <Eye className="h-3 w-3 mr-1" />
                Voir
              </Button>
              <Button size="sm" variant="outline">
                <Download className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="outline">
                <Share2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderDocumentList = (document: Document) => {
    const isSelected = selectedDocuments.includes(document.id);
    
    return (
      <div 
        key={document.id}
        className={`flex items-center space-x-4 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
          isSelected ? 'bg-blue-50 border-blue-200' : ''
        }`}
        onClick={() => {
          if (isSelected) {
            setSelectedDocuments(prev => prev.filter(id => id !== document.id));
          } else {
            setSelectedDocuments(prev => [...prev, document.id]);
          }
        }}
      >
        {getFileIcon(document.type)}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h3 className="font-medium truncate">{document.name}</h3>
            {document.isStarred && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
            {document.isLocked && <Lock className="h-4 w-4 text-gray-500" />}
            <Badge className={getStatusColor(document.status)}>
              {document.status}
            </Badge>
          </div>
          <p className="text-sm text-gray-600 truncate">{document.description}</p>
          <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
            <span>{formatFileSize(document.size)}</span>
            <span>v{document.version}</span>
            <span>{new Date(document.updatedAt).toLocaleDateString('fr-FR')}</span>
            <span>{document.viewCount} vues</span>
          </div>
        </div>
        
        <div className="flex space-x-1">
          <Button size="sm" variant="outline">
            <Eye className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="outline">
            <Download className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="outline">
            <Share2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  };

  const renderFolderTree = () => (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Dossiers</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div 
            className={`flex items-center space-x-2 p-2 rounded cursor-pointer hover:bg-gray-100 ${
              !currentFolder ? 'bg-blue-100' : ''
            }`}
            onClick={() => setCurrentFolder('')}
          >
            <Folder className="h-4 w-4" />
            <span className="text-sm font-medium">Tous les documents</span>
          </div>
          
          {folders.map(folder => (
            <div 
              key={folder.id}
              className={`flex items-center space-x-2 p-2 rounded cursor-pointer hover:bg-gray-100 ${
                currentFolder === folder.id ? 'bg-blue-100' : ''
              }`}
              onClick={() => setCurrentFolder(folder.id)}
            >
              <FolderOpen className="h-4 w-4 text-blue-600" />
              <div className="flex-1">
                <div className="text-sm font-medium">{folder.name}</div>
                <div className="text-xs text-gray-500">
                  {folder.documentCount} documents
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderUploadDialog = () => (
    <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Télécharger des Documents</DialogTitle>
          <DialogDescription>
            Glissez-déposez vos fichiers ou cliquez pour sélectionner
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Upload area */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
            <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-600">Glissez vos fichiers ici</p>
            <p className="text-sm text-gray-500 mb-4">ou cliquez pour sélectionner</p>
            <Button variant="outline">
              Sélectionner des fichiers
            </Button>
          </div>
          
          {/* Upload settings */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="upload-folder">Dossier de destination</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un dossier" />
                </SelectTrigger>
                <SelectContent>
                  {folders.map(folder => (
                    <SelectItem key={folder.id} value={folder.id}>
                      {folder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="upload-tags">Tags (séparés par des virgules)</Label>
              <Input id="upload-tags" placeholder="tag1, tag2, tag3" />
            </div>
            
            <div>
              <Label htmlFor="upload-description">Description</Label>
              <Textarea id="upload-description" placeholder="Description du document" />
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
              Annuler
            </Button>
            <Button>
              Télécharger
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FileText className="h-8 w-8 animate-pulse text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion Documentaire</h1>
          <p className="text-gray-600">Organisez, partagez et collaborez sur vos documents</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Paramètres
          </Button>
          <Button size="sm" onClick={() => setShowUploadDialog(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Télécharger
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {renderFolderTree()}
          
          {/* Quick stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Statistiques</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Total documents:</span>
                <span className="font-medium">{documents.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Espace utilisé:</span>
                <span className="font-medium">
                  {formatFileSize(documents.reduce((sum, doc) => sum + doc.size, 0))}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Documents favoris:</span>
                <span className="font-medium">
                  {documents.filter(doc => doc.isStarred).length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Search and filters */}
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher des documents..."
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filtres
            </Button>
            <Select value={viewMode} onValueChange={(value: 'grid' | 'list') => setViewMode(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grid">Grille</SelectItem>
                <SelectItem value="list">Liste</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bulk actions */}
          {selectedDocuments.length > 0 && (
            <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium">
                {selectedDocuments.length} document(s) sélectionné(s)
              </span>
              <div className="flex space-x-1 ml-auto">
                <Button size="sm" variant="outline">
                  <Download className="h-3 w-3 mr-1" />
                  Télécharger
                </Button>
                <Button size="sm" variant="outline">
                  <Move className="h-3 w-3 mr-1" />
                  Déplacer
                </Button>
                <Button size="sm" variant="outline">
                  <Archive className="h-3 w-3 mr-1" />
                  Archiver
                </Button>
                <Button size="sm" variant="outline">
                  <Trash2 className="h-3 w-3 mr-1" />
                  Supprimer
                </Button>
              </div>
            </div>
          )}

          {/* Documents display */}
          {filteredDocuments.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-600">Aucun document trouvé</p>
                <p className="text-sm text-gray-500">
                  {searchQuery ? 'Essayez de modifier votre recherche' : 'Commencez par télécharger des documents'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className={
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                : 'space-y-3'
            }>
              {filteredDocuments.map(doc => 
                viewMode === 'grid' ? renderDocumentCard(doc) : renderDocumentList(doc)
              )}
            </div>
          )}
        </div>
      </div>

      {renderUploadDialog()}
    </div>
  );
};

export default DocumentManagementSystem;
