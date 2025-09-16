"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area,
  BarChart, 
  Bar,
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Users,
  CreditCard,
  Activity,
  Target
} from 'lucide-react';

// Datos de demo para el dashboard
const demoStats = {
  totalTransactions: 1247,
  totalAmount: 284750,
  successRate: 94.2,
  activeAlerts: 23,
  monthlyGrowth: 12.5
};

const transactionData = [
  { month: 'Ene', income: 45000, expenses: 32000, transactions: 180 },
  { month: 'Feb', income: 52000, expenses: 28000, transactions: 210 },
  { month: 'Mar', income: 48000, expenses: 35000, transactions: 195 },
  { month: 'Abr', income: 61000, expenses: 33000, transactions: 240 },
  { month: 'May', income: 55000, expenses: 38000, transactions: 220 },
  { month: 'Jun', income: 67000, expenses: 41000, transactions: 265 },
];

const categoryData = [
  { name: 'Ventas', value: 45, color: '#0088FE' },
  { name: 'Servicios', value: 25, color: '#00C49F' },
  { name: 'Operaciones', value: 20, color: '#FFBB28' },
  { name: 'Otros', value: 10, color: '#FF8042' },
];

const recentTransactions = [
  { id: 1, description: 'Pago de cliente', amount: 2500, type: 'INCOME', status: 'COMPLETED', confidence: 0.98, date: '2024-01-15 14:30' },
  { id: 2, description: 'Compra de insumos', amount: -1200, type: 'EXPENSE', status: 'COMPLETED', confidence: 0.95, date: '2024-01-15 13:45' },
  { id: 3, description: 'Transferencia bancaria', amount: 3500, type: 'TRANSFER', status: 'PENDING', confidence: 0.87, date: '2024-01-15 12:20' },
  { id: 4, description: 'Pago de servicios', amount: -800, type: 'EXPENSE', status: 'FAILED', confidence: 0.92, date: '2024-01-15 11:15' },
  { id: 5, description: 'Ingreso por ventas', amount: 4200, type: 'INCOME', status: 'COMPLETED', confidence: 0.99, date: '2024-01-15 10:30' },
];

const recentAlerts = [
  { id: 1, title: 'Transacción sospechosa', severity: 'HIGH', status: 'OPEN', confidence: 0.85, date: '2024-01-15 14:45' },
  { id: 2, title: 'Límite de gasto excedido', severity: 'MEDIUM', status: 'IN_PROGRESS', confidence: 0.92, date: '2024-01-15 13:30' },
  { id: 3, title: 'Detección de patrón inusual', severity: 'HIGH', status: 'OPEN', confidence: 0.78, date: '2024-01-15 12:15' },
  { id: 4, title: 'Error en procesamiento', severity: 'CRITICAL', status: 'RESOLVED', confidence: 0.95, date: '2024-01-15 11:00' },
];

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'LOW': return 'bg-green-500';
    case 'MEDIUM': return 'bg-yellow-500';
    case 'HIGH': return 'bg-orange-500';
    case 'CRITICAL': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'COMPLETED': return 'bg-green-500';
    case 'PENDING': return 'bg-yellow-500';
    case 'FAILED': return 'bg-red-500';
    case 'CANCELLED': return 'bg-gray-500';
    case 'OPEN': return 'bg-red-500';
    case 'IN_PROGRESS': return 'bg-yellow-500';
    case 'RESOLVED': return 'bg-green-500';
    default: return 'bg-gray-500';
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
};

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState('month');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Dashboard NEOIA
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Monitoreo transaccional en tiempo real
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              Exportar Reporte
            </Button>
            <Button size="sm">
              Nueva Transacción
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Total Transacciones
              </CardTitle>
              <CreditCard className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {demoStats.totalTransactions.toLocaleString()}
              </div>
              <div className="flex items-center space-x-1 text-xs text-green-600 mt-1">
                <TrendingUp className="h-3 w-3" />
                <span>+{demoStats.monthlyGrowth}%</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Monto Total
              </CardTitle>
              <DollarSign className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {formatCurrency(demoStats.totalAmount)}
              </div>
              <div className="flex items-center space-x-1 text-xs text-green-600 mt-1">
                <TrendingUp className="h-3 w-3" />
                <span>+8.2%</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Tasa de Éxito
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {demoStats.successRate}%
              </div>
              <div className="flex items-center space-x-1 text-xs text-green-600 mt-1">
                <TrendingUp className="h-3 w-3" />
                <span>+2.1%</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Alertas Activas
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {demoStats.activeAlerts}
              </div>
              <div className="flex items-center space-x-1 text-xs text-red-600 mt-1">
                <TrendingDown className="h-3 w-3" />
                <span>-5.3%</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Confianza Promedio
              </CardTitle>
              <Target className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                91.2%
              </div>
              <div className="flex items-center space-x-1 text-xs text-green-600 mt-1">
                <TrendingUp className="h-3 w-3" />
                <span>+1.8%</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Tendencia de Transacciones
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Evolución mensual de ingresos y gastos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={transactionData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    formatter={(value) => formatCurrency(Number(value))}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid rgba(0, 0, 0, 0.1)',
                      borderRadius: '8px',
                      backdropFilter: 'blur(10px)'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="income" 
                    stackId="1" 
                    stroke="#10b981" 
                    fill="url(#colorIncome)" 
                    fillOpacity={0.6}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="expenses" 
                    stackId="2" 
                    stroke="#ef4444" 
                    fill="url(#colorExpenses)" 
                    fillOpacity={0.6}
                  />
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Distribución por Categoría
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Desglose de transacciones por tipo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value}%`, 'Porcentaje']}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid rgba(0, 0, 0, 0.1)',
                      borderRadius: '8px',
                      backdropFilter: 'blur(10px)'
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Transacciones Recientes
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Últimas transacciones monitoreadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] w-full">
                <div className="space-y-3">
                  {recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/50">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(transaction.status)}`} />
                        <div>
                          <p className="font-medium text-sm text-slate-900 dark:text-slate-100">
                            {transaction.description}
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            {transaction.date}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold text-sm ${
                          transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(transaction.amount)}
                        </p>
                        <div className="flex items-center space-x-1">
                          <span className="text-xs text-slate-600 dark:text-slate-400">
                            {Math.round(transaction.confidence * 100)}%
                          </span>
                          <div className="w-8 h-1 bg-slate-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${
                                transaction.confidence > 0.9 ? 'bg-green-500' : 
                                transaction.confidence > 0.7 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${transaction.confidence * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Alertas Recientes
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Monitoreo de seguridad y detección de anomalías
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] w-full">
                <div className="space-y-3">
                  {recentAlerts.map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/50">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${getSeverityColor(alert.severity)}`} />
                        <div>
                          <p className="font-medium text-sm text-slate-900 dark:text-slate-100">
                            {alert.title}
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            {alert.date}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {alert.severity}
                        </Badge>
                        <div className="text-right">
                          <div className="flex items-center space-x-1">
                            <span className="text-xs text-slate-600 dark:text-slate-400">
                              {Math.round(alert.confidence * 100)}%
                            </span>
                            <div className="w-8 h-1 bg-slate-200 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${
                                  alert.confidence > 0.9 ? 'bg-green-500' : 
                                  alert.confidence > 0.7 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${alert.confidence * 100}%` }}
                              />
                            </div>
                          </div>
                          <Badge 
                            variant="outline" 
                            className={`text-xs mt-1 ${
                              alert.status === 'OPEN' ? 'border-red-500 text-red-600' :
                              alert.status === 'IN_PROGRESS' ? 'border-yellow-500 text-yellow-600' :
                              'border-green-500 text-green-600'
                            }`}
                          >
                            {alert.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}