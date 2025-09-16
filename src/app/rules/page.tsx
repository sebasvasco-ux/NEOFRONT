"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Settings, 
  Play, 
  Pause, 
  Save,
  Target,
  Shield,
  Bell,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3
} from 'lucide-react';

// Datos de demo para reglas
const demoRules = [
  {
    id: '1',
    name: 'Detección de transacciones sospechosas',
    description: 'Detecta transacciones que exceden umbrales predefinidos',
    type: 'DETECTION',
    condition: {
      amount: { operator: '>', value: 10000 },
      timeRange: '1h',
      frequency: { max: 3, period: '1h' }
    },
    action: {
      alert: true,
      severity: 'HIGH',
      notification: 'email'
    },
    confidence: 0.85,
    active: true,
    createdAt: '2024-01-10T10:00:00Z',
    lastTriggered: '2024-01-15T14:30:00Z',
    triggerCount: 47
  },
  {
    id: '2',
    name: 'Prevención de lavado de dinero',
    description: 'Bloquea transacciones que coinciden con patrones de lavado de dinero',
    type: 'PREVENTION',
    condition: {
      pattern: 'multiple_small_transactions',
      amount: { operator: '<', value: 1000 },
      frequency: { max: 10, period: '24h' }
    },
    action: {
      block: true,
      alert: true,
      severity: 'CRITICAL',
      requireReview: true
    },
    confidence: 0.92,
    active: true,
    createdAt: '2024-01-08T09:30:00Z',
    lastTriggered: '2024-01-15T11:45:00Z',
    triggerCount: 23
  },
  {
    id: '3',
    name: 'Notificación de gastos excesivos',
    description: 'Envía notificaciones cuando los gastos exceden el presupuesto',
    type: 'NOTIFICATION',
    condition: {
      category: 'expenses',
      amount: { operator: '>', value: 5000 },
      period: 'monthly'
    },
    action: {
      alert: true,
      severity: 'MEDIUM',
      notification: ['email', 'sms'],
      report: true
    },
    confidence: 0.78,
    active: false,
    createdAt: '2024-01-05T14:20:00Z',
    lastTriggered: '2024-01-14T16:20:00Z',
    triggerCount: 12
  },
  {
    id: '4',
    name: 'Monitoreo de transacciones internacionales',
    description: 'Supervisa transacciones que involucran divisas extranjeras',
    type: 'DETECTION',
    condition: {
      currency: 'foreign',
      amount: { operator: '>', value: 5000 },
      riskCountries: ['high_risk']
    },
    action: {
      alert: true,
      severity: 'HIGH',
      holdForReview: true,
      documentation: true
    },
    confidence: 0.88,
    active: true,
    createdAt: '2024-01-12T11:15:00Z',
    lastTriggered: '2024-01-15T09:30:00Z',
    triggerCount: 8
  }
];

const ruleTypes = [
  { value: 'DETECTION', label: 'Detección', icon: Target, color: 'bg-blue-500' },
  { value: 'PREVENTION', label: 'Prevención', icon: Shield, color: 'bg-red-500' },
  { value: 'NOTIFICATION', label: 'Notificación', icon: Bell, color: 'bg-green-500' }
];

const severityLevels = [
  { value: 'LOW', label: 'Baja', color: 'bg-green-500' },
  { value: 'MEDIUM', label: 'Media', color: 'bg-yellow-500' },
  { value: 'HIGH', label: 'Alta', color: 'bg-orange-500' },
  { value: 'CRITICAL', label: 'Crítica', color: 'bg-red-500' }
];

const operators = [
  { value: '>', label: 'Mayor que' },
  { value: '<', label: 'Menor que' },
  { value: '>=', label: 'Mayor o igual que' },
  { value: '<=', label: 'Menor o igual que' },
  { value: '==', label: 'Igual a' },
  { value: '!=', label: 'Diferente de' }
];

export default function RulesConfiguration() {
  const [rules, setRules] = useState(demoRules);
  const [selectedRule, setSelectedRule] = useState(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);

  const [newRule, setNewRule] = useState({
    name: '',
    description: '',
    type: 'DETECTION',
    condition: {
      amount: { operator: '>', value: '' },
      timeRange: '1h',
      frequency: { max: '', period: '1h' }
    },
    action: {
      alert: true,
      severity: 'MEDIUM',
      notification: 'email'
    },
    confidence: 0.8,
    active: true
  });

  const toggleRuleStatus = (ruleId) => {
    setRules(rules.map(rule => 
      rule.id === ruleId ? { ...rule, active: !rule.active } : rule
    ));
  };

  const deleteRule = (ruleId) => {
    setRules(rules.filter(rule => rule.id !== ruleId));
  };

  const createRule = () => {
    const rule = {
      ...newRule,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      lastTriggered: null,
      triggerCount: 0
    };
    setRules([...rules, rule]);
    setIsCreateDialogOpen(false);
    setNewRule({
      name: '',
      description: '',
      type: 'DETECTION',
      condition: {
        amount: { operator: '>', value: '' },
        timeRange: '1h',
        frequency: { max: '', period: '1h' }
      },
      action: {
        alert: true,
        severity: 'MEDIUM',
        notification: 'email'
      },
      confidence: 0.8,
      active: true
    });
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Configuración de Reglas
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Gestiona las reglas de detección y prevención con calificación de confianza
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Regla
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Crear Nueva Regla</DialogTitle>
                  <DialogDescription>
                    Configura una nueva regla de detección o prevención con su calificación de confianza
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nombre de la Regla</Label>
                      <Input
                        id="name"
                        value={newRule.name}
                        onChange={(e) => setNewRule({...newRule, name: e.target.value})}
                        placeholder="Ej: Detección de transacciones sospechosas"
                      />
                    </div>
                    <div>
                      <Label htmlFor="type">Tipo de Regla</Label>
                      <Select value={newRule.type} onValueChange={(value) => setNewRule({...newRule, type: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ruleTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      value={newRule.description}
                      onChange={(e) => setNewRule({...newRule, description: e.target.value})}
                      placeholder="Describe el propósito y funcionamiento de la regla"
                    />
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Condiciones</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>Operador</Label>
                        <Select value={newRule.condition.amount.operator} onValueChange={(value) => 
                          setNewRule({
                            ...newRule, 
                            condition: {
                              ...newRule.condition,
                              amount: {...newRule.condition.amount, operator: value}
                            }
                          })
                        }>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {operators.map((op) => (
                              <SelectItem key={op.value} value={op.value}>
                                {op.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Monto</Label>
                        <Input
                          type="number"
                          value={newRule.condition.amount.value}
                          onChange={(e) => 
                            setNewRule({
                              ...newRule, 
                              condition: {
                                ...newRule.condition,
                                amount: {...newRule.condition.amount, value: e.target.value}
                              }
                            })
                          }
                          placeholder="10000"
                        />
                      </div>
                      <div>
                        <Label>Rango de Tiempo</Label>
                        <Select value={newRule.condition.timeRange} onValueChange={(value) => 
                          setNewRule({
                            ...newRule, 
                            condition: {...newRule.condition, timeRange: value}
                          })
                        }>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1h">1 hora</SelectItem>
                            <SelectItem value="24h">24 horas</SelectItem>
                            <SelectItem value="7d">7 días</SelectItem>
                            <SelectItem value="30d">30 días</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Acciones</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Severidad</Label>
                        <Select value={newRule.action.severity} onValueChange={(value) => 
                          setNewRule({
                            ...newRule, 
                            action: {...newRule.action, severity: value}
                          })
                        }>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {severityLevels.map((level) => (
                              <SelectItem key={level.value} value={level.value}>
                                {level.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Notificación</Label>
                        <Select value={newRule.action.notification} onValueChange={(value) => 
                          setNewRule({
                            ...newRule, 
                            action: {...newRule.action, notification: value}
                          })
                        }>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="sms">SMS</SelectItem>
                            <SelectItem value="push">Push</SelectItem>
                            <SelectItem value="all">Todas</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Calificación</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Confianza ({Math.round(newRule.confidence * 100)}%)</Label>
                        <Input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={newRule.confidence}
                          onChange={(e) => setNewRule({...newRule, confidence: parseFloat(e.target.value)})}
                          className="w-full"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={newRule.active}
                          onCheckedChange={(checked) => setNewRule({...newRule, active: checked})}
                        />
                        <Label>Activa</Label>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={createRule}>
                      <Save className="h-4 w-4 mr-2" />
                      Crear Regla
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Rules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rules.map((rule) => {
            const ruleType = ruleTypes.find(rt => rt.value === rule.type);
            const severity = severityLevels.find(s => s.value === rule.action.severity);
            const IconComponent = ruleType?.icon || Target;

            return (
              <Card key={rule.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${ruleType?.color}`} />
                      <IconComponent className="h-5 w-5 text-slate-600" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={rule.active}
                        onCheckedChange={() => toggleRuleStatus(rule.id)}
                        size="sm"
                      />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar regla?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. La regla "{rule.name}" será eliminada permanentemente.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteRule(rule.id)}>
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {rule.name}
                  </CardTitle>
                  <CardDescription className="text-sm text-slate-600 dark:text-slate-400">
                    {rule.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className={`${ruleType?.color} text-white border-0`}>
                      {ruleType?.label}
                    </Badge>
                    <Badge variant="outline" className={`${severity?.color} text-white border-0`}>
                      {severity?.label}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Confianza</span>
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm font-medium ${getConfidenceColor(rule.confidence)}`}>
                          {getConfidenceLabel(rule.confidence)}
                        </span>
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          ({Math.round(rule.confidence * 100)}%)
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          rule.confidence >= 0.9 ? 'bg-green-500' : 
                          rule.confidence >= 0.7 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${rule.confidence * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-600 dark:text-slate-400">Veces activada:</span>
                      <div className="font-semibold text-slate-900 dark:text-slate-100">
                        {rule.triggerCount}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-600 dark:text-slate-400">Estado:</span>
                      <div className="flex items-center space-x-1">
                        <div className={`w-2 h-2 rounded-full ${rule.active ? 'bg-green-500' : 'bg-gray-400'}`} />
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {rule.active ? 'Activa' : 'Inactiva'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {rule.lastTriggered && (
                    <div className="text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Última activación:</span>
                      <div className="font-medium text-slate-900 dark:text-slate-100">
                        {formatDate(rule.lastTriggered)}
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Settings className="h-4 w-4 mr-2" />
                      Configurar
                    </Button>
                    <Button variant="outline" size="sm">
                      <BarChart3 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Statistics Summary */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Resumen de Reglas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {rules.length}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Total Reglas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {rules.filter(r => r.active).length}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Activas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {rules.filter(r => r.type === 'DETECTION').length}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Detección</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {rules.filter(r => r.type === 'PREVENTION').length}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Prevención</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}