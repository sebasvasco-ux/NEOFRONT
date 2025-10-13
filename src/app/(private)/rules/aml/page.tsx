"use client";

import { useState } from 'react';
import { Shield, Search, Filter, Plus, Edit2, Trash2, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Interfaces
type RuleStatus = 'active' | 'inactive' | 'testing';
type RuleSeverity = 'critical' | 'high' | 'medium' | 'low';
type RuleCategory = 'Umbrales' | 'Listas' | 'Patrones' | 'Geográfico' | 'Frecuencia' | 'Riesgo Cliente';

interface AMLRule {
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
const demoRules: AMLRule[] = [
  {
    id: 'AML-1010-001',
    name: 'Monto de Transacción Superior a Umbral',
    category: 'Umbrales',
    interface: '1010',
    severity: 'critical',
    status: 'active',
    description: 'Detecta transacciones que superan el umbral configurado',
    threshold: '> $10,000',
    triggerCount: 234,
    lastTriggered: '2025-10-10 14:23:12'
  },
  {
    id: 'AML-1010-002',
    name: 'Cliente en Lista PEP',
    category: 'Listas',
    interface: '1010',
    severity: 'critical',
    status: 'active',
    description: 'Verifica si el cliente está en lista de Personas Expuestas Políticamente',
    triggerCount: 45,
    lastTriggered: '2025-10-10 13:15:44'
  },
  {
    id: 'AML-1010-003',
    name: 'Patrón de Structuring',
    category: 'Patrones',
    interface: '1010',
    severity: 'high',
    status: 'active',
    description: 'Detecta múltiples transacciones por debajo del umbral en período corto',
    threshold: '> 5 tx en 24h < $9,500',
    triggerCount: 128,
    lastTriggered: '2025-10-10 11:42:33'
  },
  {
    id: 'AML-1010-004',
    name: 'Transacción desde País de Alto Riesgo',
    category: 'Geográfico',
    interface: '1010',
    severity: 'high',
    status: 'active',
    description: 'Alerta sobre transacciones originadas en jurisdicciones de alto riesgo',
    triggerCount: 67,
    lastTriggered: '2025-10-10 10:28:19'
  },
  {
    id: 'AML-1020-001',
    name: 'Transferencia Internacional Inusual',
    category: 'Patrones',
    interface: '1020',
    severity: 'medium',
    status: 'active',
    description: 'Detecta transferencias internacionales fuera del perfil del cliente',
    triggerCount: 89,
    lastTriggered: '2025-10-10 09:15:22'
  },
  {
    id: 'AML-1020-002',
    name: 'Cambio Abrupto en Volumen',
    category: 'Frecuencia',
    interface: '1020',
    severity: 'high',
    status: 'active',
    description: 'Detecta aumentos significativos en volumen de transacciones',
    threshold: '> 300% del promedio',
    triggerCount: 156,
    lastTriggered: '2025-10-10 08:47:11'
  },
  {
    id: 'AML-1030-001',
    name: 'Cliente de Alto Riesgo',
    category: 'Riesgo Cliente',
    interface: '1030',
    severity: 'critical',
    status: 'active',
    description: 'Monitorea actividad de clientes clasificados como alto riesgo',
    triggerCount: 23,
    lastTriggered: '2025-10-09 16:32:05'
  },
  {
    id: 'AML-1030-002',
    name: 'Round Amount Pattern',
    category: 'Patrones',
    interface: '1030',
    severity: 'medium',
    status: 'active',
    description: 'Detecta patrón de montos redondos frecuentes',
    threshold: '> 70% montos redondos',
    triggerCount: 45,
    lastTriggered: '2025-10-09 14:21:33'
  },
  {
    id: 'AML-1040-001',
    name: 'Velocidad de Fondos Inusual',
    category: 'Frecuencia',
    interface: '1040',
    severity: 'high',
    status: 'active',
    description: 'Detecta fondos que se mueven rápidamente entre cuentas',
    threshold: '< 24 horas permanencia',
    triggerCount: 78,
    lastTriggered: '2025-10-09 12:15:44'
  },
  {
    id: 'AML-1040-002',
    name: 'Lista OFAC Match',
    category: 'Listas',
    interface: '1040',
    severity: 'critical',
    status: 'active',
    description: 'Verifica coincidencias con la lista de sanciones OFAC',
    triggerCount: 12,
    lastTriggered: '2025-10-08 18:42:11'
  }
];

const interfaces = ['1010', '1020', '1030', '1040'];
const categories: RuleCategory[] = ['Umbrales', 'Listas', 'Patrones', 'Geográfico', 'Frecuencia', 'Riesgo Cliente'];

export default function ReglasAMLPage() {
  const [selectedInterface, setSelectedInterface] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

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
    <div className="aml-page min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between animate-fade-in-up">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/50 animate-pulse">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Reglas AML
              </h1>
              <p className="high-contrast-muted mt-1">Configuración de reglas Anti Lavado de Dinero</p>
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
                <div className="text-xs text-cyan-600 font-semibold">
                  {stat.triggers.toLocaleString()} alertas
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filter Section - Main Focus */}
        <div className="glass-card p-6 border-2 border-cyan-500/30 shadow-xl shadow-cyan-500/20 animate-fade-in-up">
          <div className="flex items-center space-x-3 mb-4">
            <Filter className="w-5 h-5 text-cyan-600" />
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
                      <div className="text-2xl font-bold text-cyan-600">{stat.total}</div>
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
            <Badge className="bg-cyan-500 text-white">
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
                <Shield className="w-12 h-12 mx-auto mb-3 opacity-50" />
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
                      <div className="text-xs text-cyan-600 font-mono mt-1">{rule.threshold}</div>
                    )}
                  </div>

                  {/* Category */}
                  <div className="col-span-2 flex items-center">
                    <Badge className="bg-blue-50 text-blue-700 border border-blue-200">
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
