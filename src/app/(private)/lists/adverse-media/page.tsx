"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Search, 
  Download, 
  Eye, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  User,
  Shield,
  Database,
  Filter,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Users,
  Globe,
  Activity,
  BarChart3,
  RefreshCw,
  Zap,
  Target,
  FileText,
  Calendar,
  MapPin,
  Award,
  Star
} from 'lucide-react';
import { adverseMediaService, AdverseMediaRecord } from '@/lib/services/adverse-media.service';

interface UserProfile {
  sub: string;
  email: string;
  role?: string;
  [key: string]: any;
}

interface UserInfo {
  authenticated: boolean;
  profile: UserProfile;
  expires_at?: number;
  rotations?: number;
}

// Roles y permisos
const ROLE_PERMISSIONS = {
  USER: ['sample'],
  ROLE_USER: ['sample'],
  OPERATOR: ['sample', 'search'],
  ROLE_OPERATOR: ['sample', 'search'],
  ANALYST: ['sample', 'search', 'details'],
  ROLE_ANALYST: ['sample', 'search', 'details'],
  SUPERVISOR: ['sample', 'search', 'details'],
  ROLE_SUPERVISOR: ['sample', 'search', 'details'],
  ADMIN: ['sample', 'search', 'details', 'all'],
  ROLE_ADMIN: ['sample', 'search', 'details', 'all']
};

// Datos de demo para mientras conectamos con la API real
const demoData: AdverseMediaRecord[] = [
  {
    id: 1,
    name: "Carlos Rodriguez Martinez",
    alias: "El Gato",
    dateOfBirth: "1985-03-15",
    nationality: "MX",
    riskLevel: "HIGH",
    category: "Financial Crime",
    source: "Interpol Red Notice",
    lastUpdated: "2024-01-15T10:30:00Z",
    statusUI: "ACTIVE",
    status: "ACTIVE"
  },
  {
    id: 2,
    name: "Maria Gonzalez Lopez",
    dateOfBirth: "1978-07-22",
    nationality: "ES",
    riskLevel: "MEDIUM",
    category: "Sanctions",
    source: "OFAC List",
    lastUpdated: "2024-01-14T15:45:00Z",
    statusUI: "ACTIVE",
    status: "ACTIVE"
  },
  {
    id: 3,
    name: "John Smith",
    alias: "JS",
    dateOfBirth: "1990-11-08",
    nationality: "US",
    riskLevel: "LOW",
    category: "Regulatory",
    source: "SEC Enforcement",
    lastUpdated: "2024-01-13T09:20:00Z",
    statusUI: "UNDER_REVIEW",
    status: "UNDER_REVIEW"
  }
];

export default function AdverseMediaPage() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [adverseMediaData, setAdverseMediaData] = useState<AdverseMediaRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<AdverseMediaRecord | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para búsqueda avanzada
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('lastUpdated');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Obtener información del usuario
  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const response = await fetch('/api/oidc/me');
      if (response.ok) {
        const data = await response.json();
        setUserInfo(data);
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  // Cargar datos de muestra
  useEffect(() => {
    if (userInfo) {
      loadSampleData();
    }
  }, [userInfo]);

  const loadSampleData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Llamada real a la API
      const data = await adverseMediaService.getSampleData(50);
      // Validar que sea un array
      if (Array.isArray(data)) {
        setAdverseMediaData(data);
        setTotalItems(data.length);
      } else {
        console.warn('API returned non-array data:', data);
        setAdverseMediaData(demoData);
        setTotalItems(demoData.length);
        setError('API returned unexpected data format. Using demo data.');
      }
      setLoading(false);
      
    } catch (error) {
      console.error('Error loading sample data:', error);
      setError('Error loading data from API. Using demo data.');
      // Fallback a datos de demo si la API falla
      setAdverseMediaData(demoData);
      setTotalItems(demoData.length);
      setLoading(false);
    }
  };

  // Funciones de permisos
  const hasPermission = (permission: string): boolean => {
    if (!userInfo?.profile?.role) return false;
    const userPermissions = ROLE_PERMISSIONS[userInfo.profile.role as keyof typeof ROLE_PERMISSIONS] || [];
    return userPermissions.includes(permission);
  };

  // Debug: Verificar el rol del usuario
  console.log('[DEBUG] User Info:', userInfo);
  console.log('[DEBUG] User role:', userInfo?.profile?.role);
  console.log('[DEBUG] ROLE_PERMISSIONS:', ROLE_PERMISSIONS);
  console.log('[DEBUG] User permissions:', ROLE_PERMISSIONS[userInfo?.profile?.role as keyof typeof ROLE_PERMISSIONS]);
  console.log('[DEBUG] Has search permission:', hasPermission('search'));
  console.log('[DEBUG] Has details permission:', hasPermission('details'));
  console.log('[DEBUG] Has all permission:', hasPermission('all'));

  const canSearch = hasPermission('search');
  const canViewDetails = hasPermission('details');
  const canExportAll = hasPermission('all');

  // Datos filtrados y ordenados
  const filteredAndSortedData = useMemo(() => {
    let filtered = [...adverseMediaData];

    // Aplicar filtros con validación de campos undefined
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(record =>
        (record.name?.toLowerCase() || '').includes(searchLower) ||
        (record.alias?.toLowerCase() || '').includes(searchLower) ||
        (record.category?.toLowerCase() || '').includes(searchLower) ||
        (record.source?.toLowerCase() || '').includes(searchLower)
      );
    }

    if (riskFilter !== 'all') {
      filtered = filtered.filter(record => record.riskLevel === riskFilter);
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(record => record.category === categoryFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(record => record.status === statusFilter);
    }

    // Aplicar ordenamiento con validación
    filtered.sort((a, b) => {
      let aValue = a[sortBy as keyof AdverseMediaRecord];
      let bValue = b[sortBy as keyof AdverseMediaRecord];

      if (aValue === undefined || aValue === null) aValue = '';
      if (bValue === undefined || bValue === null) bValue = '';

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });

    return filtered;
  }, [adverseMediaData, searchTerm, riskFilter, categoryFilter, statusFilter, sortBy, sortOrder]);

  // Datos paginados
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAndSortedData.slice(startIndex, endIndex);
  }, [filteredAndSortedData, currentPage, itemsPerPage]);

  // Actualizar total de items cuando cambian los filtros
  useEffect(() => {
    setTotalItems(filteredAndSortedData.length);
    setCurrentPage(1); // Resetear a la primera página cuando cambian los filtros
  }, [filteredAndSortedData.length]);

  // Búsqueda (solo para OPERATOR+)
  const handleSearch = async () => {
    if (!canSearch || !searchTerm.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const results = await adverseMediaService.searchByName({
        name: searchTerm,
        phonetic: true,
        exact: false
      });
      
      // Validar que sea un array
      if (Array.isArray(results)) {
        setAdverseMediaData(results);
        setTotalItems(results.length);
      } else {
        console.warn('Search API returned non-array data:', results);
        setError('Search returned unexpected data format.');
        setAdverseMediaData([]);
        setTotalItems(0);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error searching:', error);
      setError('Error searching. Please try again.');
      // Fallback a filtrado local de datos actuales
      const filtered = adverseMediaData.filter(record => 
        record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.alias?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setAdverseMediaData(filtered);
      setTotalItems(filtered.length);
      setLoading(false);
    }
  };

  // Ver detalles (solo para ANALYST+)
  const handleViewDetails = async (record: AdverseMediaRecord) => {
    console.log('[handleViewDetails] called with record:', record.id, 'canViewDetails:', canViewDetails);
    if (!canViewDetails) {
      console.warn('[handleViewDetails] No permission to view details');
      return;
    }

    setLoading(true);
    try {
      const details = await adverseMediaService.getDetails(record.id);
      setSelectedRecord(details);
      setIsDetailsOpen(true);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching details:', error);
      setError('Error fetching details. Showing basic information.');
      // Fallback a mostrar el registro actual
      setSelectedRecord(record);
      setIsDetailsOpen(true);
      setLoading(false);
    }
  };

  // Exportar todos los datos (solo para ADMIN)
  const handleExportAll = async () => {
    if (!canExportAll) return;
    
    try {
      await adverseMediaService.downloadExport();
      // Opcional: mostrar mensaje de éxito
      console.log('Export completed successfully');
    } catch (error) {
      console.error('Error exporting:', error);
      setError('Error exporting data. Please check your permissions and try again.');
    }
  };

  // Calcular estadísticas
  const stats = useMemo(() => {
    const total = adverseMediaData.length;
    const highRisk = adverseMediaData.filter(r => r.riskLevel === 'HIGH').length;
    const mediumRisk = adverseMediaData.filter(r => r.riskLevel === 'MEDIUM').length;
    const lowRisk = adverseMediaData.filter(r => r.riskLevel === 'LOW').length;
    const active = adverseMediaData.filter(r => r.status === 'ACTIVE').length;
    
    return { total, highRisk, mediumRisk, lowRisk, active };
  }, [adverseMediaData]);

  // UI Helper functions
  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'HIGH': return 'bg-gradient-to-r from-red-500 to-red-600 text-white border-red-600';
      case 'MEDIUM': return 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-orange-600';
      case 'LOW': return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white border-emerald-600';
      default: return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white border-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white';
      case 'INACTIVE': return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
      case 'UNDER_REVIEW': return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white';
      default: return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCountryFlag = (countryCode: string): string => {
    const flags: Record<string, string> = {
      'MX': '🇲🇽',
      'US': '🇺🇸',
      'ES': '🇪🇸',
      'CO': '🇨🇴',
      'AR': '🇦🇷',
      'BR': '🇧🇷',
      'CL': '🇨🇱',
      'PE': '🇵🇪',
      'VE': '🇻🇪',
      'EC': '🇪🇨',
      'DO': '🇩🇴',
      'CR': '🇨🇷',
      'PA': '🇵🇦',
      'GT': '🇬🇹',
      'HN': '🇭🇳',
      'SV': '🇸🇻',
      'NI': '🇳🇮',
      'UY': '🇺🇾',
      'PY': '🇵🇾',
      'BO': '🇧🇴',
      'CU': '🇨🇺',
    };
    return flags[countryCode?.toUpperCase()] || '🌍';
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (!userInfo) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-cyan-300 border-t-transparent rounded-full animate-spin mx-auto animation-delay-150"></div>
          </div>
          <p className="text-muted-foreground animate-pulse">Cargando información de usuario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Animated Background */}
      <div className="animated-bg"></div>
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Adverse Media Database
          </h1>
          <p className="text-muted-foreground text-lg">
            Advanced intelligence platform for global risk assessment
          </p>
          {userInfo.profile?.role && (
            <Badge variant="outline" className="premium-badge">
              <Shield className="h-3 w-3 mr-1" />
              Role: {userInfo.profile.role}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          <Button 
            onClick={loadSampleData} 
            variant="outline" 
            size="sm"
            className="glass-card hover:scale-105 transition-transform"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          {canExportAll && (
            <Button 
              onClick={handleExportAll} 
              className="gradient-btn hover:scale-105 transition-transform"
            >
              <Download className="h-4 w-4 mr-2" />
              Export All
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="premium-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Records</p>
                <p className="text-2xl font-bold text-cyan-400">{stats.total}</p>
              </div>
              <Database className="h-8 w-8 text-cyan-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="premium-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">High Risk</p>
                <p className="text-2xl font-bold text-red-400">{stats.highRisk}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="premium-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Medium Risk</p>
                <p className="text-2xl font-bold text-yellow-400">{stats.mediumRisk}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="premium-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Low Risk</p>
                <p className="text-2xl font-bold text-green-400">{stats.lowRisk}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="premium-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-emerald-400">{stats.active}</p>
              </div>
              <Activity className="h-8 w-8 text-emerald-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Search and Filters - Always Visible */}
      <Card className="premium-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2 text-cyan-400" />
            Advanced Search & Filters
            {!canSearch && (
              <Badge variant="outline" className="ml-2 text-xs">
                <Shield className="h-3 w-3 mr-1" />
                Operator+ Required
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="lg:col-span-2">
              <Label htmlFor="adverse-search" className="text-sm font-medium">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="adverse-search"
                  placeholder="Search by name, alias, category, source..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && canSearch && handleSearch()}
                  className={`modern-input pl-10 ${!canSearch ? 'opacity-75 cursor-not-allowed' : ''}`}
                  disabled={!canSearch}
                />
                {!canSearch && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </div>
              {!canSearch && (
                <p className="text-xs text-muted-foreground mt-1">
                  Search functionality requires Operator role or higher
                </p>
              )}
            </div>
            
            {/* Risk Filter */}
            <div>
              <Label htmlFor="risk-filter" className="text-sm font-medium">Risk Level</Label>
              <Select value={riskFilter} onValueChange={setRiskFilter}>
                <SelectTrigger id="risk-filter" className="modern-input">
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="HIGH">High Risk</SelectItem>
                  <SelectItem value="MEDIUM">Medium Risk</SelectItem>
                  <SelectItem value="LOW">Low Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Status Filter */}
            <div>
              <Label htmlFor="status-filter" className="text-sm font-medium">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status-filter" className="modern-input">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Second Row of Filters */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Category Filter */}
            <div>
              <Label htmlFor="category-filter" className="text-sm font-medium">Category</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger id="category-filter" className="modern-input">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Financial Crime">Financial Crime</SelectItem>
                  <SelectItem value="Sanctions">Sanctions</SelectItem>
                  <SelectItem value="Regulatory">Regulatory</SelectItem>
                  <SelectItem value="Corruption">Corruption</SelectItem>
                  <SelectItem value="Terrorism">Terrorism</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Sort By */}
            <div>
              <Label htmlFor="sort-by" className="text-sm font-medium">Sort By</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger id="sort-by" className="modern-input">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lastUpdated">Last Updated</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="riskLevel">Risk Level</SelectItem>
                  <SelectItem value="category">Category</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Sort Order */}
            <div>
              <Label htmlFor="sort-order" className="text-sm font-medium">Order</Label>
              <Select value={sortOrder} onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}>
                <SelectTrigger id="sort-order" className="modern-input">
                  <SelectValue placeholder="Order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Descending</SelectItem>
                  <SelectItem value="asc">Ascending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Search Button */}
          <div className="flex justify-center">
            <Button 
              onClick={handleSearch}
              className={`gradient-btn hover:scale-105 transition-transform ${!canSearch ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!canSearch || !searchTerm.trim()}
            >
              <Search className="h-4 w-4 mr-2" />
              Search Database
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card className="premium-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2 text-cyan-400" />
              Adverse Media Records
            </CardTitle>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                {filteredAndSortedData.length} of {totalItems} records
              </span>
              <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(parseInt(value))}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="flex items-center">
                <AlertTriangle className="h-4 w-4 text-red-400 mr-2" />
                <span className="text-red-400">{error}</span>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-12 h-12 border-4 border-cyan-300 border-t-transparent rounded-full animate-spin animation-delay-150"></div>
              </div>
              <span className="ml-4 text-muted-foreground">Loading data...</span>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left p-4 font-semibold text-cyan-400">Name</th>
                      <th className="text-left p-4 font-semibold text-cyan-400">Risk Level</th>
                      <th className="text-left p-4 font-semibold text-cyan-400">Category</th>
                      <th className="text-left p-4 font-semibold text-cyan-400">Status</th>
                      <th className="text-left p-4 font-semibold text-cyan-400">Last Updated</th>
                      <th className="text-left p-4 font-semibold text-cyan-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.map((record, index) => (
                      <tr 
                        key={record.id} 
                        className={`border-b border-border/30 hover:bg-cyan-500/5 transition-all duration-200 animate-slide-in-left ${canViewDetails ? 'cursor-pointer' : ''}`}
                        style={{ animationDelay: `${index * 50}ms` }}
                        onClick={() => canViewDetails && handleViewDetails(record)}
                      >
                        <td className="p-4">
                          <div className="space-y-1">
                            <div className="font-medium text-foreground">{record.name}</div>
                            {record.alias && (
                              <div className="text-sm text-muted-foreground flex items-center">
                                <Star className="h-3 w-3 mr-1" />
                                Alias: {record.alias}
                              </div>
                            )}
                            {record.nationality && (
                              <div className="text-sm text-muted-foreground flex items-center">
                                <Globe className="h-3 w-3 mr-1" />
                                {record.nationality}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge className={`${getRiskLevelColor(record.riskLevel)} border-0 shadow-lg`}>
                            <Target className="h-3 w-3 mr-1" />
                            {record.riskLevel}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline" className="border-cyan-500/30 text-cyan-400">
                            <FileText className="h-3 w-3 mr-1" />
                            {record.category}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Badge className={`${getStatusColor(record.status || 'ACTIVE')} border-0 shadow-lg`}>
                            {(record.status || 'ACTIVE') === 'ACTIVE' && <CheckCircle className="h-3 w-3 mr-1" />}
                            {(record.status || 'ACTIVE') === 'UNDER_REVIEW' && <Clock className="h-3 w-3 mr-1" />}
                            {record.status || 'ACTIVE'}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="text-sm text-muted-foreground flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(record.lastUpdated)}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            {canViewDetails && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewDetails(record);
                                }}
                                className="hover:bg-cyan-500/10 hover:border-cyan-500/50 transition-all duration-200"
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                Details
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/50">
                  <div className="text-sm text-muted-foreground">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} records
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="hover:bg-cyan-500/10"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                            className={currentPage === pageNum ? "bg-cyan-500 hover:bg-cyan-600" : "hover:bg-cyan-500/10"}
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="hover:bg-cyan-500/10"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Professional Details Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-[95vw] lg:max-w-[85vw] max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-cyan-500/20">
          <DialogHeader className="border-b border-cyan-500/20 pb-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {selectedRecord?.name || 'Record Details'}
                </DialogTitle>
                <DialogDescription className="text-base">
                  Comprehensive intelligence report and risk assessment
                </DialogDescription>
              </div>
              {selectedRecord && (
                <div className="flex flex-col items-end space-y-2">
                  <Badge className={`${getRiskLevelColor(selectedRecord.riskLevel)} border-0 shadow-lg text-sm px-3 py-1`}>
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    {selectedRecord.riskLevel} RISK
                  </Badge>
                  <Badge className={`${getStatusColor(selectedRecord.statusUI || selectedRecord.status || 'ACTIVE')} border-0 shadow-lg text-sm px-3 py-1`}>
                    {(selectedRecord.statusUI || selectedRecord.status) === 'ACTIVE' && <CheckCircle className="h-4 w-4 mr-1" />}
                    {(selectedRecord.statusUI || selectedRecord.status) === 'UNDER_REVIEW' && <Clock className="h-4 w-4 mr-1" />}
                    {selectedRecord.statusUI || selectedRecord.status || 'ACTIVE'}
                  </Badge>
                </div>
              )}
            </div>
          </DialogHeader>

          {selectedRecord && (
            <ScrollArea className="h-[calc(90vh-180px)] pr-4">
              <div className="space-y-6 py-4">
                {/* Hero Section with Key Information */}
                <div className="glass-card p-6 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/30 rounded-xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Primary Identity */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2 mb-4">
                        <User className="h-5 w-5 text-cyan-400" />
                        <h3 className="text-lg font-semibold text-cyan-400">Primary Identity</h3>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                          <User className="h-4 w-4 text-muted-foreground mt-1" />
                          <div className="flex-1">
                            <p className="text-xs text-muted-foreground">Full Name</p>
                            <p className="text-base font-semibold text-foreground">{selectedRecord.name}</p>
                          </div>
                        </div>

                        {selectedRecord.alias && (
                          <div className="flex items-start space-x-3">
                            <Star className="h-4 w-4 text-muted-foreground mt-1" />
                            <div className="flex-1">
                              <p className="text-xs text-muted-foreground">Alias / Known As</p>
                              <p className="text-base font-semibold text-cyan-300">{selectedRecord.alias}</p>
                            </div>
                          </div>
                        )}

                        {selectedRecord.nationality && (
                          <div className="flex items-start space-x-3">
                            <Globe className="h-4 w-4 text-muted-foreground mt-1" />
                            <div className="flex-1">
                              <p className="text-xs text-muted-foreground">Nationality</p>
                              <div className="flex items-center space-x-2">
                                <span className="text-2xl">{getCountryFlag(selectedRecord.nationality)}</span>
                                <p className="text-base font-semibold text-foreground">{selectedRecord.nationality}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {selectedRecord.dateOfBirth && (
                          <div className="flex items-start space-x-3">
                            <Calendar className="h-4 w-4 text-muted-foreground mt-1" />
                            <div className="flex-1">
                              <p className="text-xs text-muted-foreground">Date of Birth</p>
                              <p className="text-base font-semibold text-foreground">{selectedRecord.dateOfBirth}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Risk Assessment */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2 mb-4">
                        <Shield className="h-5 w-5 text-cyan-400" />
                        <h3 className="text-lg font-semibold text-cyan-400">Risk Assessment</h3>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                          <FileText className="h-4 w-4 text-muted-foreground mt-1" />
                          <div className="flex-1">
                            <p className="text-xs text-muted-foreground">Category</p>
                            <p className="text-base font-semibold text-foreground">{selectedRecord.category}</p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3">
                          <Database className="h-4 w-4 text-muted-foreground mt-1" />
                          <div className="flex-1">
                            <p className="text-xs text-muted-foreground">Intelligence Source</p>
                            <p className="text-base font-semibold text-foreground">{selectedRecord.source}</p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3">
                          <Clock className="h-4 w-4 text-muted-foreground mt-1" />
                          <div className="flex-1">
                            <p className="text-xs text-muted-foreground">Last Updated</p>
                            <p className="text-base font-semibold text-foreground">{formatDate(selectedRecord.lastUpdated)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Case Details Section */}
                {(selectedRecord.delito || selectedRecord.medida) && (
                  <div className="glass-card p-6 border-red-500/20 rounded-xl">
                    <div className="flex items-center space-x-2 mb-4">
                      <AlertTriangle className="h-5 w-5 text-red-400" />
                      <h3 className="text-lg font-semibold text-red-400">Case Details</h3>
                    </div>

                    <div className="space-y-4">
                      {selectedRecord.delito && (
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Shield className="h-4 w-4 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground font-medium">Crime / Offense</p>
                          </div>
                          <div className="bg-red-500/5 rounded-lg p-3 border border-red-500/10">
                            <p className="text-sm text-foreground leading-relaxed">{selectedRecord.delito}</p>
                          </div>
                        </div>
                      )}

                      {selectedRecord.medida && (
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground font-medium">Measures Taken</p>
                          </div>
                          <div className="bg-blue-500/5 rounded-lg p-3 border border-blue-500/10">
                            <p className="text-sm text-foreground leading-relaxed">{selectedRecord.medida}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Additional Intelligence */}
                {(selectedRecord.titulo || selectedRecord.organizations || selectedRecord.subject_key) && (
                  <div className="glass-card p-6 border-blue-500/20 rounded-xl">
                    <div className="flex items-center space-x-2 mb-4">
                      <BarChart3 className="h-5 w-5 text-blue-400" />
                      <h3 className="text-lg font-semibold text-blue-400">Additional Intelligence</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedRecord.titulo && (
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Award className="h-4 w-4 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground font-medium">Article Title</p>
                          </div>
                          <p className="text-sm text-foreground pl-6 leading-relaxed">{selectedRecord.titulo}</p>
                        </div>
                      )}

                      {selectedRecord.organizations && (
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground font-medium">Associated Organizations</p>
                          </div>
                          <p className="text-sm text-foreground pl-6 leading-relaxed">{selectedRecord.organizations}</p>
                        </div>
                      )}

                      {selectedRecord.subject_key && (
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Target className="h-4 w-4 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground font-medium">Subject Key</p>
                          </div>
                          <p className="text-sm text-cyan-400 pl-6 font-mono">{selectedRecord.subject_key}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Analysis Section */}
                {selectedRecord.analisis && (
                  <div className="glass-card p-6 border-green-500/20 rounded-xl">
                    <div className="flex items-center space-x-2 mb-4">
                      <BarChart3 className="h-5 w-5 text-green-400" />
                      <h3 className="text-lg font-semibold text-green-400">Detailed Analysis</h3>
                    </div>
                    <div className="bg-green-500/5 rounded-lg p-4 border border-green-500/10">
                      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                        {selectedRecord.analisis}
                      </p>
                    </div>
                  </div>
                )}

                {/* Summary Section */}
                {selectedRecord.summary && (
                  <div className="glass-card p-6 border-purple-500/20 rounded-xl">
                    <div className="flex items-center space-x-2 mb-4">
                      <FileText className="h-5 w-5 text-purple-400" />
                      <h3 className="text-lg font-semibold text-purple-400">Intelligence Summary</h3>
                    </div>
                    <div className="bg-purple-500/5 rounded-lg p-4 border border-purple-500/10">
                      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                        {selectedRecord.summary}
                      </p>
                    </div>
                  </div>
                )}

                {/* Implication Analysis */}
                {selectedRecord.implication && (
                  <div className="glass-card p-6 border-orange-500/20 rounded-xl">
                    <div className="flex items-center space-x-2 mb-4">
                      <AlertTriangle className="h-5 w-5 text-orange-400" />
                      <h3 className="text-lg font-semibold text-orange-400">Risk Implication Analysis</h3>
                    </div>
                    <div className="bg-orange-500/5 rounded-lg p-4 border border-orange-500/10">
                      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                        {selectedRecord.implication}
                      </p>
                    </div>
                  </div>
                )}

                {/* Metadata Footer */}
                <div className="glass-card p-4 border-slate-500/20 rounded-xl">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Database className="h-3 w-3" />
                          <span>Record ID: <span className="font-mono text-cyan-400">{selectedRecord.id}</span></span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>Last Updated: {formatDate(selectedRecord.lastUpdated)}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Shield className="h-3 w-3" />
                        <span className="text-cyan-400">Confidential Intelligence Report</span>
                      </div>
                    </div>

                    {/* Source URL row below */}
                    {selectedRecord.url_noticia && (
                      <div className="pt-2 border-t border-slate-500/20">
                        <div className="flex items-center space-x-2">
                          <Globe className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Original Source:</span>
                          <a
                            href={selectedRecord.url_noticia}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-cyan-400 hover:text-cyan-300 underline transition-colors flex items-center space-x-1"
                          >
                            <span className="truncate max-w-md">{selectedRecord.url_noticia}</span>
                            <Zap className="h-3 w-3 flex-shrink-0" />
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
