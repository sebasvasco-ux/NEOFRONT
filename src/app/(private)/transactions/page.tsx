"use client";

import { useState } from 'react';
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
  Upload,
  RefreshCw,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  Calendar,
  User,
  CreditCard
} from 'lucide-react';

// Datos de demo para transacciones
const demoTransactions = [
  {
    id: '1',
    amount: 2500,
    type: 'INCOME',
    description: 'Pago de cliente - Proyecto Web',
    category: 'Ventas',
    status: 'COMPLETED',
    confidence: 0.98,
    version: 1,
    userId: 'user1',
    userName: 'Juan Pérez',
    createdAt: '2024-01-15T14:30:00Z',
    updatedAt: '2024-01-15T14:30:00Z'
  },
  {
    id: '2',
    amount: -1200,
    type: 'EXPENSE',
    description: 'Compra de insumos de oficina',
    category: 'Operaciones',
    status: 'COMPLETED',
    confidence: 0.95,
    version: 2,
    userId: 'user1',
    userName: 'María García',
    createdAt: '2024-01-15T13:45:00Z',
    updatedAt: '2024-01-15T15:20:00Z'
  },
  {
    id: '3',
    amount: 3500,
    type: 'TRANSFER',
    description: 'Transferencia bancaria internacional',
    category: 'Transferencias',
    status: 'PENDING',
    confidence: 0.87,
    version: 1,
    userId: 'user2',
    userName: 'Carlos López',
    createdAt: '2024-01-15T12:20:00Z',
    updatedAt: '2024-01-15T12:20:00Z'
  },
  {
    id: '4',
    amount: -800,
    type: 'EXPENSE',
    description: 'Pago de servicios - Hosting',
    category: 'Tecnología',
    status: 'FAILED',
    confidence: 0.92,
    version: 1,
    userId: 'user1',
    userName: 'Ana Martínez',
    createdAt: '2024-01-15T11:15:00Z',
    updatedAt: '2024-01-15T11:15:00Z'
  },
  {
    id: '5',
    amount: 4200,
    type: 'INCOME',
    description: 'Ingreso por ventas - E-commerce',
    category: 'Ventas',
    status: 'COMPLETED',
    confidence: 0.99,
    version: 3,
    userId: 'user2',
    userName: 'Roberto Sánchez',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T16:45:00Z'
  }
];

// Datos de demo para versiones de transacciones
const demoVersions = [
  {
    id: '1',
    transactionId: '2',
    version: 1,
    amount: -1500,
    type: 'EXPENSE',
    description: 'Compra de materiales',
    category: 'Operaciones',
    status: 'PENDING',
    confidence: 0.85,
    changedBy: 'Sistema',
    changeReason: 'Corrección de monto y categoría',
    createdAt: '2024-01-15T13:45:00Z'
  },
  {
    id: '2',
    transactionId: '2',
    version: 2,
    amount: -1200,
    type: 'EXPENSE',
    description: 'Compra de insumos de oficina',
    category: 'Operaciones',
    status: 'COMPLETED',
    confidence: 0.95,
    changedBy: 'María García',
    changeReason: 'Actualización de información',
    createdAt: '2024-01-15T15:20:00Z'
  },
  {
    id: '3',
    transactionId: '5',
    version: 1,
    amount: 4000,
    type: 'INCOME',
    description: 'Ingreso por ventas',
    category: 'Ventas',
    status: 'PENDING',
    confidence: 0.90,
    changedBy: 'Sistema',
    changeReason: 'Creación inicial',
    createdAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '4',
    transactionId: '5',
    version: 2,
    amount: 4500,
    type: 'INCOME',
    description: 'Ingreso por ventas - E-commerce',
    category: 'Ventas',
    status: 'COMPLETED',
    confidence: 0.95,
    changedBy: 'Roberto Sánchez',
    changeReason: 'Actualización de monto',
    createdAt: '2024-01-15T14:20:00Z'
  },
  {
    id: '5',
    transactionId: '5',
    version: 3,
    amount: 4200,
    type: 'INCOME',
    description: 'Ingreso por ventas - E-commerce',
    category: 'Ventas',
    status: 'COMPLETED',
    confidence: 0.99,
    changedBy: 'Roberto Sánchez',
    changeReason: 'Corrección final de monto',
    createdAt: '2024-01-15T16:45:00Z'
  }
];

const transactionTypes = [
  { value: 'INCOME', label: 'Ingreso', icon: TrendingUp, color: 'text-green-600' },
  { value: 'EXPENSE', label: 'Egreso', icon: TrendingDown, color: 'text-red-600' },
  { value: 'TRANSFER', label: 'Transferencia', icon: ArrowRightLeft, color: 'text-blue-600' }
];

const transactionStatuses = [
  { value: 'PENDING', label: 'Pendiente', icon: Clock, color: 'bg-yellow-500' },
  { value: 'COMPLETED', label: 'Completada', icon: CheckCircle, color: 'bg-green-500' },
  { value: 'FAILED', label: 'Fallida', icon: XCircle, color: 'bg-red-500' },
  { value: 'CANCELLED', label: 'Cancelada', icon: XCircle, color: 'bg-gray-500' }
];

const categories = [
  'Ventas', 'Operaciones', 'Tecnología', 'Transferencias', 'Marketing', 'RRHH', 'Legal', 'Otros'
];

export default function TransactionsManagement() {
  const [transactions, setTransactions] = useState(demoTransactions);
  const [versions, setVersions] = useState(demoVersions);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isVersionDialogOpen, setIsVersionDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');

  const [newTransaction, setNewTransaction] = useState({
    amount: '',
    type: 'INCOME',
    description: '',
    category: '',
    status: 'PENDING',
    confidence: 0.8
  });

  const getStatusColor = (status) => {
    const statusObj = transactionStatuses.find(s => s.value === status);
    return statusObj?.color || 'bg-gray-500';
  };

  const getStatusIcon = (status) => {
    const statusObj = transactionStatuses.find(s => s.value === status);
    const IconComponent = statusObj?.icon || Clock;
    return <IconComponent className="h-4 w-4" />;
  };

  const getTypeIcon = (type) => {
    const typeObj = transactionTypes.find(t => t.value === type);
    const IconComponent = typeObj?.icon || DollarSign;
    return <IconComponent className="h-4 w-4" />;
  };

  const getTypeColor = (type) => {
    const typeObj = transactionTypes.find(t => t.value === type);
    return typeObj?.color || 'text-gray-600';
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.9) return 'text-green-600';
    if (confidence >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
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

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.userName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || transaction.status === statusFilter;
    const matchesType = typeFilter === 'ALL' || transaction.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const createTransaction = () => {
    const transaction = {
      ...newTransaction,
      id: Date.now().toString(),
      amount: parseFloat(newTransaction.amount),
      version: 1,
      userId: 'user1',
      userName: 'Usuario Actual',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setTransactions([...transactions, transaction]);
    setIsCreateDialogOpen(false);
    setNewTransaction({
      amount: '',
      type: 'INCOME',
      description: '',
      category: '',
      status: 'PENDING',
      confidence: 0.8
    });
  };

  const deleteTransaction = (transactionId) => {
    setTransactions(transactions.filter(t => t.id !== transactionId));
  };

  const getTransactionVersions = (transactionId) => {
    return versions.filter(v => v.transactionId === transactionId).sort((a, b) => b.version - a.version);
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/50">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
              Gestión de Transacciones
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Administra transacciones con control de versiones y calificación de confianza
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" className="glass-card hover:scale-105 transition-transform">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline" size="sm" className="glass-card hover:scale-105 transition-transform">
            <Upload className="h-4 w-4 mr-2" />
            Importar
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gradient-btn hover:scale-105 transition-transform">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Transacción
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto premium-card">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold text-foreground">Crear Nueva Transacción</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Ingresa los detalles de la nueva transacción
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="amount" className="text-sm font-medium">Monto</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={newTransaction.amount}
                    onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                    placeholder="0.00"
                    className="modern-input"
                  />
                </div>

                <div>
                  <Label htmlFor="type" className="text-sm font-medium">Tipo</Label>
                  <Select value={newTransaction.type} onValueChange={(value) => setNewTransaction({...newTransaction, type: value})}>
                    <SelectTrigger className="modern-input">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {transactionTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="description" className="text-sm font-medium">Descripción</Label>
                  <Input
                    id="description"
                    value={newTransaction.description}
                    onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                    placeholder="Descripción de la transacción"
                    className="modern-input"
                  />
                </div>

                <div>
                  <Label htmlFor="category" className="text-sm font-medium">Categoría</Label>
                  <Select value={newTransaction.category} onValueChange={(value) => setNewTransaction({...newTransaction, category: value})}>
                    <SelectTrigger className="modern-input">
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status" className="text-sm font-medium">Estado</Label>
                  <Select value={newTransaction.status} onValueChange={(value) => setNewTransaction({...newTransaction, status: value})}>
                    <SelectTrigger className="modern-input">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {transactionStatuses.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end space-x-3">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="glass-card">
                    Cancelar
                  </Button>
                  <Button onClick={createTransaction} className="gradient-btn">
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Transacción
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="premium-card p-6 animate-fade-in-up">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar transacciones..."
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
                {transactionStatuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40 modern-input">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos los tipos</SelectItem>
                {transactionTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="grid grid-cols-1 gap-6 animate-slide-in-left">
        {filteredTransactions.map((transaction) => (
          <div key={transaction.id} className="premium-card p-6 hover:scale-[1.02] transition-transform duration-300">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`p-2 rounded-lg ${
                      transaction.type === 'INCOME' ? 'bg-green-500/20' :
                      transaction.type === 'EXPENSE' ? 'bg-red-500/20' : 'bg-blue-500/20'
                    }`}>
                      <div className={getTypeColor(transaction.type)}>
                        {getTypeIcon(transaction.type)}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-foreground">
                        {transaction.description}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {transaction.category} • {transaction.userName}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <span className="text-sm text-muted-foreground">Monto</span>
                      <p className={`text-lg font-bold ${getTypeColor(transaction.type)}`}>
                        {formatCurrency(transaction.amount)}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Estado</span>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(transaction.status)}`} />
                        <span className="text-sm font-medium text-foreground">
                          {transactionStatuses.find(s => s.value === transaction.status)?.label}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Confianza</span>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`text-sm font-medium ${getConfidenceColor(transaction.confidence)}`}>
                          {Math.round(transaction.confidence * 100)}%
                        </span>
                        <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              transaction.confidence >= 0.9 ? 'bg-green-500' :
                              transaction.confidence >= 0.7 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${transaction.confidence * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Versión</span>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-sm font-medium text-foreground">
                          v{transaction.version}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {getTransactionVersions(transaction.id).length} cambios
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border text-sm text-muted-foreground">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>Creado: {formatDate(transaction.createdAt)}</span>
                      </span>
                      {transaction.updatedAt !== transaction.createdAt && (
                        <span className="flex items-center space-x-1">
                          <RefreshCw className="h-3 w-3" />
                          <span>Actualizado: {formatDate(transaction.updatedAt)}</span>
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
                          Historial completo de cambios para esta transacción
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        {getTransactionVersions(transaction.id).map((version) => (
                          <div key={version.id} className="glass-card p-4">
                            <div className="flex items-center justify-between mb-2">
                              <Badge variant="outline" className="text-xs">Versión {version.version}</Badge>
                              <span className="text-sm text-muted-foreground">
                                {formatDate(version.createdAt)}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Monto:</span>
                                <p className={`font-medium ${getTypeColor(version.type)}`}>
                                  {formatCurrency(version.amount)}
                                </p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Estado:</span>
                                <p className="font-medium text-foreground">
                                  {transactionStatuses.find(s => s.value === version.status)?.label}
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

                  <Button variant="outline" size="sm" className="glass-card hover:scale-105 transition-transform">
                    <Edit className="h-4 w-4" />
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="glass-card hover:scale-105 transition-transform text-red-400 hover:text-red-300">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="premium-card">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-foreground text-lg">¿Eliminar transacción?</AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground">
                          Esta acción no se puede deshacer. La transacción "{transaction.description}" será eliminada permanentemente.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="glass-card border border-border">Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteTransaction(transaction.id)} className="gradient-btn">
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

      {/* Statistics Summary */}
      <div className="premium-card p-6 animate-fade-in-up">
        <h3 className="text-xl font-semibold text-foreground mb-6">
          Resumen de Transacciones
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-foreground mb-2">
              {transactions.length}
            </div>
            <div className="text-sm text-muted-foreground">Total Transacciones</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">
              {transactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Total Ingresos</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-400 mb-2">
              {Math.abs(transactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0))}
            </div>
            <div className="text-sm text-muted-foreground">Total Egresos</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">
              {Math.round(transactions.reduce((sum, t) => sum + t.confidence, 0) / transactions.length * 100)}%
            </div>
            <div className="text-sm text-muted-foreground">Confianza Promedio</div>
          </div>
        </div>
      </div>
    </div>
  );
}
