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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 animate-fade-in-up">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <img src="/SpectraTRansparente.svg" alt="Spectra" className="w-12 h-12 animate-pulse-slow" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
              Dashboard SPECTRA DC
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Monitoreo transaccional en tiempo real
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" className="glass-card hover:scale-105 transition-transform">
            Exportar Reporte
          </Button>
          <Button size="sm" className="gradient-btn hover:scale-105 transition-transform">
            Nueva Transacción
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 animate-slide-in-left">
        <div className="premium-card p-6 hover:scale-105 transition-transform duration-300">
          <div className="flex items-center justify-between mb-4">
            <CreditCard className="h-8 w-8 text-blue-400" />
            <div className="modern-badge">+12.5%</div>
          </div>
          <div className="text-3xl font-bold text-foreground mb-2">
            {demoStats.totalTransactions.toLocaleString()}
          </div>
          <p className="text-muted-foreground">Total Transacciones</p>
        </div>

        <div className="premium-card p-6 hover:scale-105 transition-transform duration-300">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="h-8 w-8 text-green-400" />
            <div className="modern-badge">+8.2%</div>
          </div>
          <div className="text-3xl font-bold text-foreground mb-2">
            {formatCurrency(demoStats.totalAmount)}
          </div>
          <p className="text-muted-foreground">Monto Total</p>
        </div>

        <div className="premium-card p-6 hover:scale-105 transition-transform duration-300">
          <div className="flex items-center justify-between mb-4">
            <CheckCircle className="h-8 w-8 text-cyan-400" />
            <div className="modern-badge">+2.1%</div>
          </div>
          <div className="text-3xl font-bold text-foreground mb-2">
            {demoStats.successRate}%
          </div>
          <p className="text-muted-foreground">Tasa de Éxito</p>
        </div>

        <div className="premium-card p-6 hover:scale-105 transition-transform duration-300">
          <div className="flex items-center justify-between mb-4">
            <AlertTriangle className="h-8 w-8 text-orange-400" />
            <div className="modern-badge bg-red-500">-5.3%</div>
          </div>
          <div className="text-3xl font-bold text-foreground mb-2">
            {demoStats.activeAlerts}
          </div>
          <p className="text-muted-foreground">Alertas Activas</p>
        </div>

        <div className="premium-card p-6 hover:scale-105 transition-transform duration-300">
          <div className="flex items-center justify-between mb-4">
            <Target className="h-8 w-8 text-purple-400" />
            <div className="modern-badge">+1.8%</div>
          </div>
          <div className="text-3xl font-bold text-foreground mb-2">
            91.2%
          </div>
          <p className="text-muted-foreground">Confianza Promedio</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up">
        <div className="premium-card p-6">
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Tendencia de Transacciones
          </h3>
          <p className="text-muted-foreground mb-6">
            Evolución mensual de ingresos y gastos
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={transactionData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip
                formatter={(value) => formatCurrency(Number(value))}
                contentStyle={{
                  backgroundColor: 'rgba(30, 41, 59, 0.98)',
                  border: '1px solid rgba(148, 163, 184, 0.3)',
                  borderRadius: '8px',
                  backdropFilter: 'blur(10px)',
                  color: '#f1f5f9'
                }}
                labelStyle={{ color: '#f1f5f9' }}
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
        </div>

        <div className="premium-card p-6">
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Distribución por Categoría
          </h3>
          <p className="text-muted-foreground mb-6">
            Desglose de transacciones por tipo
          </p>
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
                  backgroundColor: 'rgba(30, 41, 59, 0.98)',
                  border: '1px solid rgba(148, 163, 184, 0.3)',
                  borderRadius: '8px',
                  backdropFilter: 'blur(10px)',
                  color: '#f1f5f9'
                }}
                labelStyle={{ color: '#f1f5f9' }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up">
        <div className="premium-card p-6">
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Transacciones Recientes
          </h3>
          <p className="text-muted-foreground mb-6">
            Últimas transacciones monitoreadas
          </p>
          <ScrollArea className="h-[300px] w-full">
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="glass-card p-4 hover:scale-102 transition-transform">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(transaction.status)}`} />
                      <div>
                        <p className="font-medium text-foreground">
                          {transaction.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {transaction.date}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        transaction.amount > 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {formatCurrency(transaction.amount)}
                      </p>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-muted-foreground">
                          {Math.round(transaction.confidence * 100)}%
                        </span>
                        <div className="w-12 h-2 bg-muted rounded-full overflow-hidden">
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
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <div className="premium-card p-6">
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Alertas Recientes
          </h3>
          <p className="text-muted-foreground mb-6">
            Monitoreo de seguridad y detección de anomalías
          </p>
          <ScrollArea className="h-[300px] w-full">
            <div className="space-y-3">
              {recentAlerts.map((alert) => (
                <div key={alert.id} className="glass-card p-4 hover:scale-102 transition-transform">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${getSeverityColor(alert.severity)}`} />
                      <div>
                        <p className="font-medium text-foreground">
                          {alert.title}
                        </p>
                        <p className="text-xs text-muted-foreground">{alert.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-muted-foreground">{alert.status}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
