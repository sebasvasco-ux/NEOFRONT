"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import {
  Trash2,
  History,
  Search,
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
  Activity
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
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-orange-400 flex items-center justify-center">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-400 via-orange-300 to-yellow-400 bg-clip-text text-transparent">
              Visor de Alertas
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Monitoreo de alertas con calificación de confianza y control de versiones
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" className="glass-card hover:scale-105 transition-transform">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline" size="sm" className="glass-card hover:scale-105 transition-transform">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6 animate-slide-in-left">
        <div className="premium-card p-6 hover:scale-105 transition-transform duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Alertas</p>
              <p className="text-3xl font-bold text-foreground mt-2">{stats.total}</p>
            </div>
            <Bell className="h-10 w-10 text-blue-400" />
          </div>
        </div>

        <div className="premium-card p-6 hover:scale-105 transition-transform duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Abiertas</p>
              <p className="text-3xl font-bold text-red-400 mt-2">{stats.open}</p>
            </div>
            <Clock className="h-10 w-10 text-red-400" />
          </div>
        </div>

        <div className="premium-card p-6 hover:scale-105 transition-transform duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">En Progreso</p>
              <p className="text-3xl font-bold text-yellow-400 mt-2">{stats.inProgress}</p>
            </div>
            <Activity className="h-10 w-10 text-yellow-400" />
          </div>
        </div>

        <div className="premium-card p-6 hover:scale-105 transition-transform duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Resueltas</p>
              <p className="text-3xl font-bold text-green-400 mt-2">{stats.resolved}</p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-400" />
          </div>
        </div>

        <div className="premium-card p-6 hover:scale-105 transition-transform duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Confianza Promedio</p>
              <p className="text-3xl font-bold text-blue-400 mt-2">{Math.round(stats.avgConfidence * 100)}%</p>
            </div>
            <Target className="h-10 w-10 text-blue-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="premium-card p-6 animate-fade-in-up">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar alertas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 modern-input"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 modern-input">
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
              <SelectTrigger className="w-40 modern-input">
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
      </div>

      {/* Alerts List */}
      <div className="grid grid-cols-1 gap-6 animate-slide-in-left">
        {filteredAlerts.map((alert) => (
          <div key={alert.id} className="premium-card p-6 hover:scale-[1.02] transition-transform duration-300">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`p-2 rounded-lg ${getSeverityColor(alert.severity)}/20`}>
                    <div className={`${getSeverityColor(alert.severity).replace('bg-', 'text-')}`}>
                      {getSeverityIcon(alert.severity)}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-foreground">
                      {alert.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {alert.description}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Severidad</span>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className={`w-2 h-2 rounded-full ${getSeverityColor(alert.severity)}`} />
                      <span className="text-sm font-medium text-foreground">
                        {severityLevels.find(s => s.value === alert.severity)?.label}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Estado</span>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(alert.status)}`} />
                      <span className="text-sm font-medium text-foreground">
                        {alertStatuses.find(s => s.value === alert.status)?.label}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Confianza</span>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`text-sm font-medium ${getConfidenceColor(alert.confidence)}`}>
                        {getConfidenceLabel(alert.confidence)}
                      </span>
                      <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            alert.confidence >= 0.9 ? 'bg-green-500' :
                            alert.confidence >= 0.7 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${alert.confidence * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Versión</span>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-sm font-medium text-foreground">
                        v{alert.version}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {getAlertVersions(alert.id).length} cambios
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border text-sm text-muted-foreground">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center space-x-1">
                      <User className="h-3 w-3" />
                      <span>Creado por: {alert.userName}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>Fecha: {formatDate(alert.createdAt)}</span>
                    </span>
                    {alert.updatedAt !== alert.createdAt && (
                      <span className="flex items-center space-x-1">
                        <RefreshCw className="h-3 w-3" />
                        <span>Actualizado: {formatDate(alert.updatedAt)}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 ml-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="glass-card hover:scale-105 transition-transform">
                      <History className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto premium-card">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-semibold text-foreground">Historial de Versiones</DialogTitle>
                      <DialogDescription className="text-muted-foreground">
                        Historial completo de cambios para esta alerta
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      {getAlertVersions(alert.id).map((version) => (
                        <div key={version.id} className="glass-card p-4">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="outline" className="text-xs">Versión {version.version}</Badge>
                            <span className="text-sm text-muted-foreground">
                              {formatDate(version.createdAt)}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Severidad:</span>
                              <p className="font-medium text-foreground">
                                {severityLevels.find(s => s.value === version.severity)?.label}
                              </p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Estado:</span>
                              <p className="font-medium text-foreground">
                                {alertStatuses.find(s => s.value === version.status)?.label}
                              </p>
                            </div>
                          </div>
                          <div className="mt-2">
                            <span className="text-muted-foreground">Descripción:</span>
                            <p className="font-medium text-foreground">{version.description}</p>
                          </div>
                          <div className="mt-2 text-sm text-muted-foreground">
                            <p>Cambiado por: {version.changedBy}</p>
                            <p>Razón: {version.changeReason}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>

                {alert.status === 'OPEN' && (
                  <Select onValueChange={(value) => updateAlertStatus(alert.id, value)}>
                    <SelectTrigger className="w-32 glass-card">
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
                    <SelectTrigger className="w-32 glass-card">
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
                    <Button variant="outline" size="sm" className="glass-card hover:scale-105 transition-transform text-red-400 hover:text-red-300">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="premium-card">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-foreground text-lg">¿Eliminar alerta?</AlertDialogTitle>
                      <AlertDialogDescription className="text-muted-foreground">
                        Esta acción no se puede deshacer. La alerta "{alert.title}" será eliminada permanentemente.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="glass-card border border-border">Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteAlert(alert.id)} className="gradient-btn">
                        Eliminar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}