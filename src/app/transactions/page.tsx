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
  User
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Gestión de Transacciones
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Administra transacciones con control de versiones y calificación de confianza
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Importar
            </Button>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Transacción
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Crear Nueva Transacción</DialogTitle>
                  <DialogDescription>
                    Ingresa los detalles de la nueva transacción
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="amount">Monto</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={newTransaction.amount}
                      onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="type">Tipo</Label>
                    <Select value={newTransaction.type} onValueChange={(value) => setNewTransaction({...newTransaction, type: value})}>
                      <SelectTrigger>
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
                    <Label htmlFor="description">Descripción</Label>
                    <Input
                      id="description"
                      value={newTransaction.description}
                      onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                      placeholder="Descripción de la transacción"
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Categoría</Label>
                    <Select value={newTransaction.category} onValueChange={(value) => setNewTransaction({...newTransaction, category: value})}>
                      <SelectTrigger>
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
                    <Label htmlFor="status">Estado</Label>
                    <Select value={newTransaction.status} onValueChange={(value) => setNewTransaction({...newTransaction, status: value})}>
                      <SelectTrigger>
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

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={createTransaction}>
                      Crear Transacción
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Buscar transacciones..."
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
                    {transactionStatuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-40">
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
          </CardContent>
        </Card>

        {/* Transactions List */}
        <div className="grid grid-cols-1 gap-4">
          {filteredTransactions.map((transaction) => (
            <Card key={transaction.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className={`p-2 rounded-lg ${
                        transaction.type === 'INCOME' ? 'bg-green-100' :
                        transaction.type === 'EXPENSE' ? 'bg-red-100' : 'bg-blue-100'
                      }`}>
                        {getTypeIcon(transaction.type)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                          {transaction.description}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {transaction.category} • {transaction.userName}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div>
                        <span className="text-sm text-slate-600 dark:text-slate-400">Monto</span>
                        <p className={`text-lg font-bold ${getTypeColor(transaction.type)}`}>
                          {formatCurrency(transaction.amount)}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-slate-600 dark:text-slate-400">Estado</span>
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(transaction.status)}`} />
                          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            {transactionStatuses.find(s => s.value === transaction.status)?.label}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-slate-600 dark:text-slate-400">Confianza</span>
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm font-medium ${getConfidenceColor(transaction.confidence)}`}>
                            {Math.round(transaction.confidence * 100)}%
                          </span>
                          <div className="w-16 h-1 bg-slate-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${
                                transaction.confidence >= 0.9 ? 'bg-green-500' : 
                                transaction.confidence >= 0.7 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${transaction.confidence * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-slate-600 dark:text-slate-400">Versión</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            v{transaction.version}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {getTransactionVersions(transaction.id).length} cambios
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 text-sm text-slate-600 dark:text-slate-400">
                      <div className="flex items-center space-x-4">
                        <span>Creado: {formatDate(transaction.createdAt)}</span>
                        {transaction.updatedAt !== transaction.createdAt && (
                          <span>Actualizado: {formatDate(transaction.updatedAt)}</span>
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
                            Historial completo de cambios para esta transacción
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          {getTransactionVersions(transaction.id).map((version) => (
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
                                    <span className="text-slate-600">Monto:</span>
                                    <p className={`font-medium ${getTypeColor(version.type)}`}>
                                      {formatCurrency(version.amount)}
                                    </p>
                                  </div>
                                  <div>
                                    <span className="text-slate-600">Estado:</span>
                                    <p className="font-medium">
                                      {transactionStatuses.find(s => s.value === version.status)?.label}
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
                    
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar transacción?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. La transacción "{transaction.description}" será eliminada permanentemente.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteTransaction(transaction.id)}>
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

        {/* Statistics Summary */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Resumen de Transacciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {transactions.length}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Total Transacciones</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {transactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0)}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Total Ingresos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {Math.abs(transactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0))}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Total Egresos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(transactions.reduce((sum, t) => sum + t.confidence, 0) / transactions.length * 100)}%
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Confianza Promedio</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}