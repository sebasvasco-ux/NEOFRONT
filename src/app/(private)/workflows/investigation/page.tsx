"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Plus,
  Search,
  Download,
  RefreshCw,
  Play,
  Pause,
  CheckCircle,
  Clock,
  XCircle,
  Workflow,
  Edit,
  Trash2,
  Eye,
  GitBranch
} from 'lucide-react';

// Tipos de workflow
interface WorkflowStep {
  id: string;
  name: string;
  type: 'action' | 'decision' | 'notification';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  duration?: string;
}

interface WorkflowData {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'completed' | 'failed';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
  progress: number;
  steps: WorkflowStep[];
  caseId?: string;
}

// Demo workflows
const demoWorkflows: WorkflowData[] = [
  {
    id: 'WF-001',
    name: 'Investigación de Transacción Sospechosa',
    description: 'Análisis completo de transacción marcada como sospechosa por monto elevado',
    status: 'active',
    priority: 'HIGH',
    assignedTo: 'Ana García',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T14:30:00Z',
    progress: 65,
    caseId: 'CASE-2024-001',
    steps: [
      { id: 's1', name: 'Recopilación de Datos', type: 'action', status: 'completed', duration: '30min' },
      { id: 's2', name: 'Análisis de Patrones', type: 'action', status: 'completed', duration: '45min' },
      { id: 's3', name: 'Verificación de Identidad', type: 'decision', status: 'in_progress', duration: '1h' },
      { id: 's4', name: 'Revisión de Compliance', type: 'action', status: 'pending' },
      { id: 's5', name: 'Notificación a Supervisor', type: 'notification', status: 'pending' }
    ]
  },
  {
    id: 'WF-002',
    name: 'Due Diligence de Cliente Corporativo',
    description: 'Verificación completa de antecedentes y documentación legal',
    status: 'active',
    priority: 'MEDIUM',
    assignedTo: 'Carlos Rodríguez',
    createdAt: '2024-01-14T09:00:00Z',
    updatedAt: '2024-01-15T11:20:00Z',
    progress: 40,
    caseId: 'CASE-2024-002',
    steps: [
      { id: 's1', name: 'Solicitud de Documentos', type: 'action', status: 'completed', duration: '1h' },
      { id: 's2', name: 'Verificación Legal', type: 'action', status: 'in_progress', duration: '2h' },
      { id: 's3', name: 'Análisis de Riesgo', type: 'decision', status: 'pending' },
      { id: 's4', name: 'Aprobación Final', type: 'decision', status: 'pending' }
    ]
  },
  {
    id: 'WF-003',
    name: 'Investigación de Lavado de Dinero',
    description: 'Análisis exhaustivo de múltiples transacciones relacionadas',
    status: 'paused',
    priority: 'CRITICAL',
    assignedTo: 'María López',
    createdAt: '2024-01-13T08:00:00Z',
    updatedAt: '2024-01-15T09:15:00Z',
    progress: 80,
    caseId: 'CASE-2024-003',
    steps: [
      { id: 's1', name: 'Mapeo de Transacciones', type: 'action', status: 'completed', duration: '3h' },
      { id: 's2', name: 'Análisis Forense', type: 'action', status: 'completed', duration: '4h' },
      { id: 's3', name: 'Identificación de Beneficiarios', type: 'action', status: 'completed', duration: '2h' },
      { id: 's4', name: 'Evaluación Legal', type: 'decision', status: 'in_progress', duration: '1h' },
      { id: 's5', name: 'Reporte a Autoridades', type: 'notification', status: 'pending' }
    ]
  }
];

export default function InvestigationWorkflow() {
  const [workflows, setWorkflows] = useState(demoWorkflows);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowData | null>(null);

  const [newWorkflow, setNewWorkflow] = useState({
    name: '',
    description: '',
    priority: 'MEDIUM',
    assignedTo: ''
  });

  const filteredWorkflows = workflows.filter(wf => {
    const matchesSearch = wf.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         wf.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         wf.caseId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || wf.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const createWorkflow = () => {
    const workflow: WorkflowData = {
      id: `WF-${String(workflows.length + 1).padStart(3, '0')}`,
      ...newWorkflow,
      status: 'active',
      priority: newWorkflow.priority as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      progress: 0,
      caseId: `CASE-2024-${String(workflows.length + 1).padStart(3, '0')}`,
      steps: [
        { id: 's1', name: 'Inicio de Investigación', type: 'action', status: 'pending' },
        { id: 's2', name: 'Recopilación de Evidencia', type: 'action', status: 'pending' },
        { id: 's3', name: 'Análisis de Datos', type: 'action', status: 'pending' },
        { id: 's4', name: 'Revisión de Resultados', type: 'decision', status: 'pending' },
        { id: 's5', name: 'Cierre de Caso', type: 'notification', status: 'pending' }
      ]
    };

    setWorkflows([...workflows, workflow]);
    setIsCreateDialogOpen(false);
    setNewWorkflow({ name: '', description: '', priority: 'MEDIUM', assignedTo: '' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'paused': return 'bg-yellow-500';
      case 'completed': return 'bg-blue-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-red-500';
      case 'HIGH': return 'bg-orange-500';
      case 'MEDIUM': return 'bg-yellow-500';
      case 'LOW': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStepIcon = (step: WorkflowStep) => {
    if (step.status === 'completed') return <CheckCircle className="h-5 w-5 text-green-400" />;
    if (step.status === 'in_progress') return <Clock className="h-5 w-5 text-yellow-400 animate-pulse" />;
    if (step.status === 'failed') return <XCircle className="h-5 w-5 text-red-400" />;
    return <Clock className="h-5 w-5 text-muted-foreground" />;
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

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-400 flex items-center justify-center">
              <Workflow className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
              Workflow de Investigación
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Gestión de procesos de investigación y compliance
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" className="glass-card hover:scale-105 transition-transform">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gradient-btn hover:scale-105 transition-transform">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Workflow
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg premium-card">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold text-foreground">Crear Nuevo Workflow</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Configura un nuevo proceso de investigación
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium">Nombre del Workflow</Label>
                  <Input
                    id="name"
                    value={newWorkflow.name}
                    onChange={(e) => setNewWorkflow({...newWorkflow, name: e.target.value})}
                    placeholder="Ej: Investigación de Transacción Sospechosa"
                    className="modern-input"
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-sm font-medium">Descripción</Label>
                  <Textarea
                    id="description"
                    value={newWorkflow.description}
                    onChange={(e) => setNewWorkflow({...newWorkflow, description: e.target.value})}
                    placeholder="Describe el objetivo de este workflow"
                    className="modern-input min-h-[100px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="priority" className="text-sm font-medium">Prioridad</Label>
                    <Select value={newWorkflow.priority} onValueChange={(value) => setNewWorkflow({...newWorkflow, priority: value})}>
                      <SelectTrigger className="modern-input">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW">Baja</SelectItem>
                        <SelectItem value="MEDIUM">Media</SelectItem>
                        <SelectItem value="HIGH">Alta</SelectItem>
                        <SelectItem value="CRITICAL">Crítica</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="assigned" className="text-sm font-medium">Asignado a</Label>
                    <Input
                      id="assigned"
                      value={newWorkflow.assignedTo}
                      onChange={(e) => setNewWorkflow({...newWorkflow, assignedTo: e.target.value})}
                      placeholder="Nombre del investigador"
                      className="modern-input"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="glass-card">
                    Cancelar
                  </Button>
                  <Button onClick={createWorkflow} className="gradient-btn">
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Workflow
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-slide-in-left">
        <div className="premium-card p-6 hover:scale-105 transition-transform duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Workflows</p>
              <p className="text-3xl font-bold text-foreground mt-2">{workflows.length}</p>
            </div>
            <Workflow className="h-10 w-10 text-indigo-400" />
          </div>
        </div>

        <div className="premium-card p-6 hover:scale-105 transition-transform duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Activos</p>
              <p className="text-3xl font-bold text-green-400 mt-2">
                {workflows.filter(w => w.status === 'active').length}
              </p>
            </div>
            <Play className="h-10 w-10 text-green-400" />
          </div>
        </div>

        <div className="premium-card p-6 hover:scale-105 transition-transform duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">En Pausa</p>
              <p className="text-3xl font-bold text-yellow-400 mt-2">
                {workflows.filter(w => w.status === 'paused').length}
              </p>
            </div>
            <Pause className="h-10 w-10 text-yellow-400" />
          </div>
        </div>

        <div className="premium-card p-6 hover:scale-105 transition-transform duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Progreso Prom.</p>
              <p className="text-3xl font-bold text-blue-400 mt-2">
                {Math.round(workflows.reduce((sum, w) => sum + w.progress, 0) / workflows.length)}%
              </p>
            </div>
            <GitBranch className="h-10 w-10 text-blue-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="premium-card p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar workflows por nombre, descripción o ID de caso..."
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
                <SelectItem value="active">Activo</SelectItem>
                <SelectItem value="paused">En Pausa</SelectItem>
                <SelectItem value="completed">Completado</SelectItem>
                <SelectItem value="failed">Fallido</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Workflows List */}
      <div className="grid grid-cols-1 gap-6 animate-slide-in-left">
        {filteredWorkflows.map((workflow) => (
          <div key={workflow.id} className="premium-card p-6 hover:scale-[1.01] transition-transform duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <Badge variant="outline" className="text-xs">{workflow.id}</Badge>
                  <Badge variant="outline" className={`${getPriorityColor(workflow.priority)} text-white border-0`}>
                    {workflow.priority}
                  </Badge>
                  <Badge variant="outline" className={`${getStatusColor(workflow.status)} text-white border-0`}>
                    {workflow.status.toUpperCase()}
                  </Badge>
                </div>

                <h3 className="text-xl font-semibold text-foreground mb-2">{workflow.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{workflow.description}</p>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <span className="text-xs text-muted-foreground">Asignado a</span>
                    <p className="text-sm font-medium text-foreground">{workflow.assignedTo}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Caso ID</span>
                    <p className="text-sm font-medium text-foreground">{workflow.caseId}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Actualizado</span>
                    <p className="text-sm font-medium text-foreground">{formatDate(workflow.updatedAt)}</p>
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">Progreso</span>
                    <span className="text-sm font-bold text-foreground">{workflow.progress}%</span>
                  </div>
                  <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                      style={{ width: `${workflow.progress}%` }}
                    />
                  </div>
                </div>

                {/* Steps */}
                <div className="space-y-2">
                  {workflow.steps.map((step, index) => (
                    <div key={step.id} className="flex items-center space-x-3 p-2 glass-card rounded-lg">
                      {getStepIcon(step)}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-foreground">{step.name}</span>
                          {step.duration && (
                            <span className="text-xs text-muted-foreground">{step.duration}</span>
                          )}
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {step.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col space-y-2 ml-4">
                <Button variant="outline" size="sm" className="glass-card hover:scale-105 transition-transform">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" className="glass-card hover:scale-105 transition-transform">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" className="glass-card hover:scale-105 transition-transform text-red-400 hover:text-red-300">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
