"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Search,
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Calendar,
  Filter,
  FileText
} from 'lucide-react';

// Datos demo de condiciones cumplidas
const demoConditions = [
  {
    id: '1',
    ruleName: 'Detección de Transacciones Sospechosas',
    conditionType: 'Monto Excesivo',
    threshold: 10000,
    actualValue: 15000,
    status: 'FULFILLED',
    triggeredAt: '2024-01-15T14:30:00Z',
    transactionId: 'TXN-001',
    severity: 'HIGH',
    action: 'Alerta Generada'
  },
  {
    id: '2',
    ruleName: 'Prevención de Lavado de Dinero',
    conditionType: 'Frecuencia de Transacciones',
    threshold: 5,
    actualValue: 12,
    status: 'FULFILLED',
    triggeredAt: '2024-01-15T13:20:00Z',
    transactionId: 'TXN-002',
    severity: 'CRITICAL',
    action: 'Transacción Bloqueada'
  },
  {
    id: '3',
    ruleName: 'Monitoreo de Gastos',
    conditionType: 'Límite Mensual',
    threshold: 50000,
    actualValue: 52000,
    status: 'FULFILLED',
    triggeredAt: '2024-01-15T12:10:00Z',
    transactionId: 'TXN-003',
    severity: 'MEDIUM',
    action: 'Notificación Enviada'
  },
  {
    id: '4',
    ruleName: 'Transacciones Internacionales',
    conditionType: 'País de Alto Riesgo',
    threshold: 1,
    actualValue: 1,
    status: 'FULFILLED',
    triggeredAt: '2024-01-15T11:00:00Z',
    transactionId: 'TXN-004',
    severity: 'HIGH',
    action: 'Revisión Manual Requerida'
  },
  {
    id: '5',
    ruleName: 'Patrón de Comportamiento Anómalo',
    conditionType: 'Desviación Estándar',
    threshold: 2.5,
    actualValue: 3.2,
    status: 'FULFILLED',
    triggeredAt: '2024-01-15T10:30:00Z',
    transactionId: 'TXN-005',
    severity: 'MEDIUM',
    action: 'Alerta de Seguridad'
  }
];

const severityLevels = [
  { value: 'LOW', label: 'Baja', color: 'bg-green-500' },
  { value: 'MEDIUM', label: 'Media', color: 'bg-yellow-500' },
  { value: 'HIGH', label: 'Alta', color: 'bg-orange-500' },
  { value: 'CRITICAL', label: 'Crítica', color: 'bg-red-500' }
];

export default function ConditionsReport() {
  const [conditions, setConditions] = useState(demoConditions);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');

  const filteredConditions = conditions.filter(condition => {
    const matchesSearch = condition.ruleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         condition.conditionType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         condition.transactionId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === 'ALL' || condition.severity === severityFilter;

    return matchesSearch && matchesSeverity;
  });

  const getSeverityColor = (severity: string) => {
    return severityLevels.find(s => s.value === severity)?.color || 'bg-gray-500';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Estadísticas
  const totalFulfilled = conditions.length;
  const criticalCount = conditions.filter(c => c.severity === 'CRITICAL').length;
  const highCount = conditions.filter(c => c.severity === 'HIGH').length;
  const avgExceedance = conditions.reduce((sum, c) => sum + ((c.actualValue - c.threshold) / c.threshold * 100), 0) / conditions.length;

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-400 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 via-emerald-300 to-teal-400 bg-clip-text text-transparent">
              Condiciones Cumplidas
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Reporte de reglas y condiciones activadas
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" className="glass-card hover:scale-105 transition-transform">
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
          <Button variant="outline" size="sm" className="glass-card hover:scale-105 transition-transform">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-slide-in-left">
        <div className="premium-card p-6 hover:scale-105 transition-transform duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Cumplidas</p>
              <p className="text-3xl font-bold text-foreground mt-2">{totalFulfilled}</p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-400" />
          </div>
        </div>

        <div className="premium-card p-6 hover:scale-105 transition-transform duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Críticas</p>
              <p className="text-3xl font-bold text-red-400 mt-2">{criticalCount}</p>
            </div>
            <XCircle className="h-10 w-10 text-red-400" />
          </div>
        </div>

        <div className="premium-card p-6 hover:scale-105 transition-transform duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Alta Prioridad</p>
              <p className="text-3xl font-bold text-orange-400 mt-2">{highCount}</p>
            </div>
            <TrendingUp className="h-10 w-10 text-orange-400" />
          </div>
        </div>

        <div className="premium-card p-6 hover:scale-105 transition-transform duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">% Excedencia Prom.</p>
              <p className="text-3xl font-bold text-blue-400 mt-2">{Math.round(avgExceedance)}%</p>
            </div>
            <TrendingDown className="h-10 w-10 text-blue-400" />
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
                placeholder="Buscar por regla, condición o ID de transacción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 modern-input"
              />
            </div>
          </div>
          <div className="flex gap-2">
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

      {/* Conditions Table */}
      <div className="premium-card p-6 animate-slide-in-left">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-foreground">
            Listado de Condiciones
          </h3>
          <Badge variant="outline" className="text-sm">
            {filteredConditions.length} registros
          </Badge>
        </div>

        <div className="space-y-4">
          {filteredConditions.map((condition) => (
            <div key={condition.id} className="glass-card p-5 hover:scale-[1.01] transition-transform duration-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <h4 className="text-lg font-semibold text-foreground">{condition.ruleName}</h4>
                    <Badge variant="outline" className={`${getSeverityColor(condition.severity)} text-white border-0`}>
                      {severityLevels.find(s => s.value === condition.severity)?.label}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                    <div>
                      <span className="text-xs text-muted-foreground">Tipo de Condición</span>
                      <p className="text-sm font-medium text-foreground">{condition.conditionType}</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Umbral</span>
                      <p className="text-sm font-medium text-foreground">{condition.threshold.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Valor Actual</span>
                      <p className="text-sm font-medium text-green-400">{condition.actualValue.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Excedencia</span>
                      <p className="text-sm font-medium text-orange-400">
                        +{Math.round((condition.actualValue - condition.threshold) / condition.threshold * 100)}%
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                    <span className="flex items-center space-x-1">
                      <FileText className="h-3 w-3" />
                      <span>TX: {condition.transactionId}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(condition.triggeredAt)}</span>
                    </span>
                    <Badge variant="outline" className="text-xs bg-blue-500/20 text-blue-400 border-0">
                      {condition.action}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
