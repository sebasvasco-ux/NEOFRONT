"use client";

import { useState } from 'react';
import { AlertTriangle, Search, Filter, Plus, Edit2, Trash2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Interfaces
type RuleStatus = 'active' | 'inactive' | 'testing';
type RuleSeverity = 'critical' | 'high' | 'medium' | 'low';
type RuleCategory = 'Velocidad' | 'Dispositivo' | 'Comportamiento' | 'Monto' | 'Ubicación' | 'Autenticación';

interface FraudRule {
  id: string;
  name: string;
  category: RuleCategory;
  interface: string;
  severity: RuleSeverity;
  status: RuleStatus;
  description: string;
  threshold?: string;
  triggerCount: number;
  lastTriggered?: string;
}

// Demo data
const demoRules: FraudRule[] = [
  {
    id: 'FRD-1010-001',
    name: 'Múltiples Intentos de Login',
    category: 'Autenticación',
    interface: '1010',
    severity: 'high',
    status: 'active',
    description: 'Detecta múltiples intentos de login fallidos desde misma IP',
    threshold: '> 5 intentos en 10 min',
    triggerCount: 342,
    lastTriggered: '2025-10-10 14:18:22'
  },
  {
    id: 'FRD-1010-002',
    name: 'Cambio de Dispositivo Inusual',
    category: 'Dispositivo',
    interface: '1010',
    severity: 'medium',
    status: 'active',
    description: 'Alerta cuando usuario accede desde dispositivo no reconocido',
    triggerCount: 156,
    lastTriggered: '2025-10-10 13:42:11'
  },
  {
    id: 'FRD-1010-003',
    name: 'Transacciones Rápidas Consecutivas',
    category: 'Velocidad',
    interface: '1010',
    severity: 'critical',
    status: 'active',
    description: 'Detecta transacciones múltiples en tiempo muy corto',
    threshold: '> 3 tx en < 30 seg',
    triggerCount: 89,
    lastTriggered: '2025-10-10 12:15:33'
  },
  {
    id: 'FRD-1010-004',
    name: 'Monto Fuera de Perfil',
    category: 'Monto',
    interface: '1010',
    severity: 'high',
    status: 'active',
    description: 'Monto de transacción significativamente mayor al perfil del usuario',
    threshold: '> 500% del promedio',
    triggerCount: 234,
    lastTriggered: '2025-10-10 11:28:44'
  },
  {
    id: 'FRD-1020-001',
    name: 'Ubicación Imposible',
    category: 'Ubicación',
    interface: '1020',
    severity: 'critical',
    status: 'active',
    description: 'Detecta accesos desde ubicaciones geográficamente imposibles en tiempo corto',
    threshold: 'Distancia imposible < 1 hora',
    triggerCount: 67,
    lastTriggered: '2025-10-10 10:35:19'
  },
  {
    id: 'FRD-1020-002',
    name: 'Navegador Inusual',
    category: 'Dispositivo',
    interface: '1020',
    severity: 'medium',
    status: 'active',
    description: 'Usuario accede con navegador nunca antes usado',
    triggerCount: 123,
    lastTriggered: '2025-10-10 09:42:33'
  },
  {
    id: 'FRD-1020-003',
    name: 'Patrón de Compras Inusual',
    category: 'Comportamiento',
    interface: '1020',
    severity: 'high',
    status: 'active',
    description: 'Detecta compras que no coinciden con historial del usuario',
    triggerCount: 178,
    lastTriggered: '2025-10-10 08:19:55'
  },
  {
    id: 'FRD-1030-001',
    name: 'Uso de VPN/Proxy',
    category: 'Ubicación',
    interface: '1030',
    severity: 'medium',
    status: 'active',
    description: 'Detecta conexiones a través de VPN o proxy',
    triggerCount: 445,
    lastTriggered: '2025-10-09 18:22:41'
  },
  {
    id: 'FRD-1030-002',
    name: 'Velocidad de Tipeo Anormal',
    category: 'Comportamiento',
    interface: '1030',
    severity: 'low',
    status: 'active',
    description: 'Detecta velocidad de ingreso de datos inconsistente con usuario',
    threshold: 'Patrón estadístico',
    triggerCount: 92,
    lastTriggered: '2025-10-09 16:48:12'
  },
  {
    id: 'FRD-1040-001',
    name: 'Acceso desde País Bloqueado',
    category: 'Ubicación',
    interface: '1040',
    severity: 'critical',
    status: 'active',
    description: 'Intento de acceso desde país en lista de bloqueo',
    triggerCount: 34,
    lastTriggered: '2025-10-09 14:15:28'
  },
  {
    id: 'FRD-1040-002',
    name: 'Cambio de Email Sospechoso',
    category: 'Comportamiento',
    interface: '1040',
    severity: 'high',
    status: 'active',
    description: 'Cambio de email seguido de transacción grande',
    threshold: '< 24h antes de tx > $5k',
    triggerCount: 28,
    lastTriggered: '2025-10-09 12:33:16'
  }
];

const interfaces = ['1010', '1020', '1030', '1040'];
const categories: RuleCategory[] = ['Velocidad', 'Dispositivo', 'Comportamiento', 'Monto', 'Ubicación', 'Autenticación'];

export default function ReglasFraudePage() {
  const [selectedInterface, setSelectedInterface] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // Filter rules
  const filteredRules = demoRules.filter(rule => {
    const matchesInterface = !selectedInterface || rule.interface === selectedInterface;
    const matchesSearch = !searchQuery ||
      rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || rule.category === selectedCategory;

    return matchesInterface && matchesSearch && matchesCategory;
  });

  // Calculate category stats
  const categoriesStats = categories.map(category => {
    const categoryRules = demoRules.filter(r => r.category === category);
    const total = categoryRules.length;
    const active = categoryRules.filter(r => r.status === 'active').length;
    const triggers = categoryRules.reduce((sum, r) => sum + r.triggerCount, 0);

    return { category, total, active, triggers };
  });

  // Calculate interface stats
  const interfaceStats = interfaces.map(iface => {
    const ifaceRules = demoRules.filter(r => r.interface === iface);
    return {
      interface: iface,
      total: ifaceRules.length,
      active: ifaceRules.filter(r => r.status === 'active').length,
      critical: ifaceRules.filter(r => r.severity === 'critical').length
    };
  });

  const getSeverityColor = (severity: RuleSeverity) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'high': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'medium': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'low': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    }
  };

  const getStatusIcon = (status: RuleStatus) => {
    switch (status) {
      case 'active': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'inactive': return <XCircle className="w-4 h-4 text-gray-400" />;
      case 'testing': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  return (
    <div className="fraude-page min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between animate-fade-in-up">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/50 animate-pulse">
              <AlertTriangle className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Reglas de Fraude
              </h1>
              <p className="high-contrast-muted mt-1">Configuración de reglas de detección de fraude</p>
            </div>
          </div>
          <Button className="gradient-btn">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Regla
          </Button>
        </div>

        {/* Category Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categoriesStats.map((stat) => (
            <div key={stat.category} className="premium-card p-4 animate-fade-in-up">
              <div className="text-xs font-medium high-contrast-muted mb-2">{stat.category}</div>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stat.active}</div>
                  <div className="text-xs high-contrast-muted">de {stat.total} activas</div>
                </div>
                <div className="text-xs text-orange-600 font-semibold">
                  {stat.triggers.toLocaleString()} alertas
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filter Section - Main Focus */}
        <div className="glass-card p-6 border-2 border-orange-500/30 shadow-xl shadow-orange-500/20 animate-fade-in-up">
          <div className="flex items-center space-x-3 mb-4">
            <Filter className="w-5 h-5 text-orange-600" />
            <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Interface Filter - Centro de atención */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Interfaz (Registro Origen)
              </label>
              <Select value={selectedInterface} onValueChange={setSelectedInterface}>
                <SelectTrigger className="modern-input">
                  <SelectValue placeholder="Todas las interfaces" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las interfaces</SelectItem>
                  {interfaces.map(iface => (
                    <SelectItem key={iface} value={iface}>
                      Interfaz {iface}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Categoría
              </label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="modern-input">
                  <SelectValue placeholder="Todas las categorías" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Search */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Búsqueda
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nombre, ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="modern-input pl-10"
                />
              </div>
            </div>
          </div>

          {/* Interface Stats - Show when interface selected */}
          {selectedInterface && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-3 gap-4">
                {interfaceStats
                  .filter(stat => stat.interface === selectedInterface)
                  .map(stat => (
                    <div key={stat.interface} className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{stat.total}</div>
                      <div className="text-xs high-contrast-muted">Total Reglas</div>
                    </div>
                  ))
                }
                {interfaceStats
                  .filter(stat => stat.interface === selectedInterface)
                  .map(stat => (
                    <div key={`${stat.interface}-active`} className="text-center">
                      <div className="text-2xl font-bold text-emerald-600">{stat.active}</div>
                      <div className="text-xs high-contrast-muted">Activas</div>
                    </div>
                  ))
                }
                {interfaceStats
                  .filter(stat => stat.interface === selectedInterface)
                  .map(stat => (
                    <div key={`${stat.interface}-critical`} className="text-center">
                      <div className="text-2xl font-bold text-red-600">{stat.critical}</div>
                      <div className="text-xs high-contrast-muted">Críticas</div>
                    </div>
                  ))
                }
              </div>
            </div>
          )}
        </div>

        {/* Rules Table - Compact Row Layout */}
        <div className="premium-card p-6 animate-fade-in-up">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Reglas Configuradas {selectedInterface && `- Interfaz ${selectedInterface}`}
            </h2>
            <Badge className="bg-orange-500 text-white">
              {filteredRules.length} reglas
            </Badge>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 pb-3 border-b border-gray-200 text-xs font-semibold high-contrast-muted uppercase tracking-wide">
            <div className="col-span-1">Estado</div>
            <div className="col-span-2">ID / Interfaz</div>
            <div className="col-span-3">Nombre</div>
            <div className="col-span-2">Categoría</div>
            <div className="col-span-1">Severidad</div>
            <div className="col-span-1">Alertas</div>
            <div className="col-span-1">Última</div>
            <div className="col-span-1 text-right">Acciones</div>
          </div>

          {/* Table Rows */}
          <div className="space-y-2 mt-2">
            {filteredRules.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No se encontraron reglas con los filtros aplicados</p>
              </div>
            ) : (
              filteredRules.map((rule) => (
                <div
                  key={rule.id}
                  className="grid grid-cols-12 gap-4 py-3 px-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200 group"
                >
                  {/* Status */}
                  <div className="col-span-1 flex items-center">
                    {getStatusIcon(rule.status)}
                  </div>

                  {/* ID / Interface */}
                  <div className="col-span-2">
                    <div className="font-mono text-xs text-gray-900 font-semibold">{rule.id}</div>
                    <Badge className="mt-1 bg-gray-100 text-gray-700 text-xs">
                      IF {rule.interface}
                    </Badge>
                  </div>

                  {/* Name */}
                  <div className="col-span-3">
                    <div className="font-medium text-sm text-gray-900">{rule.name}</div>
                    <div className="text-xs high-contrast-muted line-clamp-1">{rule.description}</div>
                    {rule.threshold && (
                      <div className="text-xs text-orange-600 font-mono mt-1">{rule.threshold}</div>
                    )}
                  </div>

                  {/* Category */}
                  <div className="col-span-2 flex items-center">
                    <Badge className="bg-orange-50 text-orange-700 border border-orange-200">
                      {rule.category}
                    </Badge>
                  </div>

                  {/* Severity */}
                  <div className="col-span-1 flex items-center">
                    <Badge className={`border ${getSeverityColor(rule.severity)}`}>
                      {rule.severity}
                    </Badge>
                  </div>

                  {/* Trigger Count */}
                  <div className="col-span-1 flex items-center">
                    <div className="text-sm font-semibold text-gray-900">
                      {rule.triggerCount.toLocaleString()}
                    </div>
                  </div>

                  {/* Last Triggered */}
                  <div className="col-span-1">
                    {rule.lastTriggered && (
                      <div className="text-xs high-contrast-muted">
                        {rule.lastTriggered.split(' ')[1]}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="col-span-1 flex items-center justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                      <Edit2 className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500 hover:text-red-700">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
