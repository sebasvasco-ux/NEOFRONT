"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  History, 
  Search,
  Filter,
  Download,
  RefreshCw,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  Shield,
  Bell,
  User,
  Calendar,
  Target,
  Activity,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

// Datos de demo para alertas
const demoAlerts = [
  {
    id: '1',
    title: 'Transacción sospechosa detectada',
    description: 'Se detectó una transacción de alto monto fuera del horario habitual',
    severity: 'HIGH',
    status: 'OPEN',
    confidence: 0.85,
    version: 1,
    userId: 'user1',
    userName: 'Sistema',
    transactionId: 'tx123',
    ruleId: 'rule456',
    createdAt: '2024-01-15T14:45:00Z',
    updatedAt: '2024-01-15T14:45:00Z'
  },
  {
    id: '2',
    title: 'Límite de gasto excedido',
    description: 'El usuario ha excedido el límite de gasto mensual en la categoría de operaciones',
    severity: 'MEDIUM',
    status: 'IN_PROGRESS',
    confidence: 0.92,
    version: 2,
    userId: 'user2',
    userName: 'María García',
    transactionId: 'tx124',
    ruleId: 'rule789',
    createdAt: '2024-01-15T13:30:00Z',
    updatedAt: '2024-01-15T15:20:00Z'
  },
  {
    id: '3',
    title: 'Detección de patrón inusual',
    description: 'Se identificó un patrón de múltiples transacciones pequeñas en corto tiempo',
    severity: 'HIGH',
    status: 'OPEN',
    confidence: 0.78,
    version: 1,
    userId: 'user1',
    userName: 'Sistema',
    transactionId: 'tx125',
    ruleId: 'rule012',
    createdAt: '2024-01-15T12:15:00Z',
    updatedAt: '2024-01-15T12:15:00Z'
  },
  {
    id: '4',
    title: 'Error en procesamiento de pago',
    description: 'Falló el procesamiento de un pago debido a problemas de conectividad',
    severity: 'CRITICAL',
    status: 'RESOLVED',
    confidence: 0.95,
    version: 3,
    userId: 'user3',
    userName: 'Carlos López',
    transactionId: 'tx126',
    ruleId: 'rule345',
    createdAt: '2024-01-15T11:00:00Z',
    updatedAt: '2024-01-15T16:30:00Z'
  },
  {
    id: '5',
    title: 'Actividad inusual detectada',
    description: 'Se detectó actividad de usuario desde una ubicación geográfica inusual',
    severity: 'MEDIUM',
    status: 'DISMISSED',
    confidence: 0.88,
    version: 1,
    userId: 'user1',
    userName: 'Sistema',
    transactionId: null,
    ruleId: 'rule678',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  }
];

// Datos de demo para versiones de alertas
const demoVersions = [
  {
    id: '1',
    alertId: '2',
    version: 1,
    title: 'Límite de gasto excedido',
    description: 'El usuario ha excedido el límite de gasto mensual',
    severity: 'HIGH',
    status: 'OPEN',
    confidence: 0.85,
    changedBy: 'Sistema',
    changeReason: 'Detección inicial',
    createdAt: '2024-01-15T13:30:00Z'
  },
  {
    id: '2',
    alertId: '2',
    version: 2,
    title: 'Límite de gasto excedido',
    description: 'El usuario ha excedido el límite de gasto mensual en la categoría de operaciones',
    severity: 'MEDIUM',
    status: 'IN_PROGRESS',
    confidence: 0.92,
    changedBy: 'María García',
    changeReason: 'Actualización de severidad y estado',
    createdAt: '2024-01-15T15:20:00Z'
  },
  {
    id: '3',
    alertId: '4',
    version: 1,
    title: 'Error en procesamiento de pago',
    description: 'Falló el procesamiento de un pago',
    severity: 'CRITICAL',
    status: 'OPEN',
    confidence: 0.90,
    changedBy: 'Sistema',
    changeReason: 'Detección de error',
    createdAt: '2024-01-15T11:00:00Z'
  },
  {
    id: '4',
    alertId: '4',
    version: 2,
    title: 'Error en procesamiento de pago',
    description: 'Falló el procesamiento de un pago debido a problemas de conectividad',
    severity: 'CRITICAL',
    status: 'IN_PROGRESS',
    confidence: 0.93,
    changedBy: 'Carlos López',
    changeReason: 'Investigación en curso',
    createdAt: '2024-01-15T14:00:00Z'
  },
  {
    id: '5',
    alertId: '4',
    version: 3,
    title: 'Error en procesamiento de pago',
    description: 'Falló el procesamiento de un pago debido a problemas de conectividad',
    severity: 'CRITICAL',
    status: 'RESOLVED',
    confidence: 0.95,
    changedBy: 'Carlos López',
    changeReason: 'Problema de conectividad resuelto',
    createdAt: '2024-01-15T16:30:00Z'
  }
];

const severityLevels = [
  { value: 'LOW', label: 'Baja', icon: Shield, color: 'bg-green-500', textColor: 'text-green-600' },
  { value: 'MEDIUM', label: 'Media', icon: AlertTriangle, color: 'bg-yellow-500', textColor: 'text-yellow-600' },
  { value: 'HIGH', label: 'Alta', icon: AlertTriangle, color: 'bg-orange-500', textColor: 'text-orange-600' },
  { value: 'CRITICAL', label: 'Crítica', icon: AlertTriangle, color: 'bg-red-500', textColor: 'text-red-600' }
];

const alertStatuses = [
  { value: 'OPEN', label: 'Abierta', icon: Clock, color: 'bg-red-500' },
  { value: 'IN_PROGRESS', label: 'En Progreso', icon: Activity, color: 'bg-yellow-500' },
  { value: 'RESOLVED', label: 'Resuelta', icon: CheckCircle, color: 'bg-green-500' },
  { value: 'DISMISSED', label: 'Descartada', icon: XCircle, color: 'bg-gray-500' }
];

export default function AlertsViewer() {
  const [alerts, setAlerts] = useState(demoAlerts);
  const [versions, setVersions] = useState(demoVersions);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [isVersionDialogOpen, setIsVersionDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');

  const getSeverityColor = (severity) => {
    const severityObj = severityLevels.find(s => s.value === severity);
    return severityObj?.color || 'bg-gray-500';
  };

  const getSeverityIcon = (severity) => {
    const severityObj = severityLevels.find(s => s.value === severity);
    const IconComponent = severityObj?.icon || AlertTriangle;
    return <IconComponent className="h-4 w-4" />;
  };

  const getStatusColor = (status) => {
    const statusObj = alertStatuses.find(s => s.value === status);
    return statusObj?.color || 'bg-gray-500';
  };

  const getStatusIcon = (status) => {
    const statusObj = alertStatuses.find(s => s.value === status);
    const IconComponent = statusObj?.icon || Clock;
    return <IconComponent className="h-4 w-4" />;
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.9) return 'text-green-600';
    if (confidence >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceLabel = (confidence) => {
    if (confidence >= 0.9) return 'Muy Alta';
    if (confidence >= 0.7) return 'Alta';
    if (confidence >= 0.5) return 'Media';
    return 'Baja';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.userName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || alert.status === statusFilter;
    const matchesSeverity = severityFilter === 'ALL' || alert.severity === severityFilter;
    
    return matchesSearch && matchesStatus && matchesSeverity;
  });

  const updateAlertStatus = (alertId, newStatus) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId ? { 
        ...alert, 
        status: newStatus,
        updatedAt: new Date().toISOString(),
        version: alert.version + 1
      } : alert
    ));
  };

  const deleteAlert = (alertId) => {
    setAlerts(alerts.filter(a => a.id !== alertId));
  };

  const getAlertVersions = (alertId) => {
    return versions.filter(v => v.alertId === alertId).sort((a, b) => b.version - a.version);
  };

  const getAlertStats = () => {
    const total = alerts.length;
    const open = alerts.filter(a => a.status === 'OPEN').length;
    const inProgress = alerts.filter(a => a.status === 'IN_PROGRESS').length;
    const resolved = alerts.filter(a => a.status === 'RESOLVED').length;
    const dismissed = alerts.filter(a => a.status === 'DISMISSED').length;
    const avgConfidence = alerts.reduce((sum, a) => sum + a.confidence, 0) / total;

    return { total, open, inProgress, resolved, dismissed, avgConfidence };
  };

  const stats = getAlertStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Visor de Alertas
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Monitoreo de alertas con calificación de confianza y control de versiones
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Total Alertas</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.total}</p>
                </div>
                <Bell className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Abiertas</p>
                  <p className="text-2xl font-bold text-red-600">{stats.open}</p>
                </div>
                <Clock className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">En Progreso</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
                </div>
                <Activity className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Resueltas</p>
                  <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Confianza Promedio</p>
                  <p className="text-2xl font-bold text-blue-600">{Math.round(stats.avgConfidence * 100)}%</p>
                </div>
                <Target className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Buscar alertas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todos los estados</SelectItem>
                    {alertStatuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Severidad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todas las severidades</SelectItem>
                    {severityLevels.map((severity) => (
                      <SelectItem key={severity.value} value={severity.value}>
                        {severity.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alerts List */}
        <div className="grid grid-cols-1 gap-4">
          {filteredAlerts.map((alert) => (
            <Card key={alert.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className={`p-2 rounded-lg ${getSeverityColor(alert.severity)} bg-opacity-20`}>
                        {getSeverityIcon(alert.severity)}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                          {alert.title}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {alert.description}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div>
                        <span className="text-sm text-slate-600 dark:text-slate-400">Severidad</span>
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${getSeverityColor(alert.severity)}`} />
                          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            {severityLevels.find(s => s.value === alert.severity)?.label}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-slate-600 dark:text-slate-400">Estado</span>
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(alert.status)}`} />
                          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            {alertStatuses.find(s => s.value === alert.status)?.label}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-slate-600 dark:text-slate-400">Confianza</span>
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm font-medium ${getConfidenceColor(alert.confidence)}`}>
                            {getConfidenceLabel(alert.confidence)}
                          </span>
                          <div className="w-16 h-1 bg-slate-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${
                                alert.confidence >= 0.9 ? 'bg-green-500' : 
                                alert.confidence >= 0.7 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${alert.confidence * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-slate-600 dark:text-slate-400">Versión</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            v{alert.version}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {getAlertVersions(alert.id).length} cambios
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 text-sm text-slate-600 dark:text-slate-400">
                      <div className="flex items-center space-x-4">
                        <span>Creado por: {alert.userName}</span>
                        <span>Fecha: {formatDate(alert.createdAt)}</span>
                        {alert.updatedAt !== alert.createdAt && (
                          <span>Actualizado: {formatDate(alert.updatedAt)}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <History className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Historial de Versiones</DialogTitle>
                          <DialogDescription>
                            Historial completo de cambios para esta alerta
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          {getAlertVersions(alert.id).map((version) => (
                            <Card key={version.id} className="bg-slate-50">
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <Badge variant="outline">Versión {version.version}</Badge>
                                  <span className="text-sm text-slate-600">
                                    {formatDate(version.createdAt)}
                                  </span>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="text-slate-600">Severidad:</span>
                                    <p className="font-medium">
                                      {severityLevels.find(s => s.value === version.severity)?.label}
                                    </p>
                                  </div>
                                  <div>
                                    <span className="text-slate-600">Estado:</span>
                                    <p className="font-medium">
                                      {alertStatuses.find(s => s.value === version.status)?.label}
                                    </p>
                                  </div>
                                </div>
                                <div className="mt-2">
                                  <span className="text-slate-600">Descripción:</span>
                                  <p className="font-medium">{version.description}</p>
                                </div>
                                <div className="mt-2 text-sm text-slate-600">
                                  <p>Cambiado por: {version.changedBy}</p>
                                  <p>Razón: {version.changeReason}</p>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </DialogContent>
                    </Dialog>

                    {alert.status === 'OPEN' && (
                      <Select onValueChange={(value) => updateAlertStatus(alert.id, value)}>
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Acción" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="IN_PROGRESS">En Progreso</SelectItem>
                          <SelectItem value="RESOLVED">Resolver</SelectItem>
                          <SelectItem value="DISMISSED">Descartar</SelectItem>
                        </SelectContent>
                      </Select>
                    )}

                    {alert.status === 'IN_PROGRESS' && (
                      <Select onValueChange={(value) => updateAlertStatus(alert.id, value)}>
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Acción" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="RESOLVED">Resolver</SelectItem>
                          <SelectItem value="OPEN">Reabrir</SelectItem>
                          <SelectItem value="DISMISSED">Descartar</SelectItem>
                        </SelectContent>
                      </Select>
                    )}

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar alerta?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. La alerta "{alert.title}" será eliminada permanentemente.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteAlert(alert.id)}>
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}