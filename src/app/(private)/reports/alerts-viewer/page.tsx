"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Download,
  RefreshCw,
  Activity,
  TrendingUp,
  TrendingDown,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye
} from 'lucide-react';

// Datos demo para el dashboard
const demoStats = {
  totalAlerts: 247,
  activeAlerts: 45,
  resolvedToday: 23,
  criticalAlerts: 12,
  avgResponseTime: '2.5h',
  resolutionRate: 87
};

const recentAlerts = [
  { id: '1', title: 'Transacción sospechosa detectada', severity: 'CRITICAL', time: '5 min', status: 'OPEN' },
  { id: '2', title: 'Límite de gasto excedido', severity: 'HIGH', time: '12 min', status: 'IN_PROGRESS' },
  { id: '3', title: 'Patrón inusual identificado', severity: 'MEDIUM', time: '25 min', status: 'OPEN' },
  { id: '4', title: 'Error en procesamiento', severity: 'HIGH', time: '45 min', status: 'RESOLVED' },
  { id: '5', title: 'Actividad geográfica inusual', severity: 'MEDIUM', time: '1h', status: 'IN_PROGRESS' }
];

const alertsByHour = [
  { hour: '00:00', count: 3 },
  { hour: '04:00', count: 2 },
  { hour: '08:00', count: 12 },
  { hour: '12:00', count: 18 },
  { hour: '16:00', count: 15 },
  { hour: '20:00', count: 8 }
];

const severityDistribution = [
  { severity: 'CRITICAL', count: 12, percentage: 15, color: 'bg-red-500' },
  { severity: 'HIGH', count: 28, percentage: 35, color: 'bg-orange-500' },
  { severity: 'MEDIUM', count: 32, percentage: 40, color: 'bg-yellow-500' },
  { severity: 'LOW', count: 8, percentage: 10, color: 'bg-green-500' }
];

export default function AlertsViewer() {
  const maxCount = Math.max(...alertsByHour.map(h => h.count));

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-400 flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 via-red-300 to-pink-400 bg-clip-text text-transparent">
              Alertas en Visor
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Dashboard en tiempo real de alertas activas
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

      {/* Main Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 animate-slide-in-left">
        <div className="premium-card p-5 hover:scale-105 transition-transform duration-300">
          <div className="text-center">
            <Activity className="h-8 w-8 text-blue-400 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold text-foreground mt-1">{demoStats.totalAlerts}</p>
          </div>
        </div>

        <div className="premium-card p-5 hover:scale-105 transition-transform duration-300">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 text-red-400 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Activas</p>
            <p className="text-2xl font-bold text-red-400 mt-1">{demoStats.activeAlerts}</p>
          </div>
        </div>

        <div className="premium-card p-5 hover:scale-105 transition-transform duration-300">
          <div className="text-center">
            <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Resueltas Hoy</p>
            <p className="text-2xl font-bold text-green-400 mt-1">{demoStats.resolvedToday}</p>
          </div>
        </div>

        <div className="premium-card p-5 hover:scale-105 transition-transform duration-300">
          <div className="text-center">
            <XCircle className="h-8 w-8 text-orange-400 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Críticas</p>
            <p className="text-2xl font-bold text-orange-400 mt-1">{demoStats.criticalAlerts}</p>
          </div>
        </div>

        <div className="premium-card p-5 hover:scale-105 transition-transform duration-300">
          <div className="text-center">
            <Clock className="h-8 w-8 text-cyan-400 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Tiempo Resp.</p>
            <p className="text-2xl font-bold text-cyan-400 mt-1">{demoStats.avgResponseTime}</p>
          </div>
        </div>

        <div className="premium-card p-5 hover:scale-105 transition-transform duration-300">
          <div className="text-center">
            <TrendingUp className="h-8 w-8 text-purple-400 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Tasa Resolución</p>
            <p className="text-2xl font-bold text-purple-400 mt-1">{demoStats.resolutionRate}%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alerts by Hour */}
        <div className="premium-card p-6">
          <h3 className="text-xl font-semibold text-foreground mb-6">
            Alertas por Hora (Últimas 24h)
          </h3>
          <div className="space-y-4">
            {alertsByHour.map((item) => (
              <div key={item.hour} className="flex items-center space-x-4">
                <span className="text-sm font-medium text-muted-foreground w-16">{item.hour}</span>
                <div className="flex-1">
                  <div className="w-full h-8 bg-muted rounded-lg overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-end pr-3 transition-all duration-500"
                      style={{ width: `${(item.count / maxCount) * 100}%` }}
                    >
                      <span className="text-white text-sm font-bold">{item.count}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Severity Distribution */}
        <div className="premium-card p-6">
          <h3 className="text-xl font-semibold text-foreground mb-6">
            Distribución por Severidad
          </h3>
          <div className="space-y-4">
            {severityDistribution.map((item) => (
              <div key={item.severity}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                    <span className="text-sm font-medium text-foreground">{item.severity}</span>
                  </div>
                  <span className="text-sm font-bold text-foreground">{item.count} ({item.percentage}%)</span>
                </div>
                <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full transition-all duration-500`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Circular Summary */}
          <div className="mt-6 p-4 glass-card text-center">
            <p className="text-sm text-muted-foreground mb-2">Total de Alertas Monitoreadas</p>
            <p className="text-4xl font-bold text-foreground">
              {severityDistribution.reduce((sum, item) => sum + item.count, 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="premium-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-foreground">
            Alertas Recientes
          </h3>
          <Badge variant="outline" className="text-sm">
            Últimas 5 alertas
          </Badge>
        </div>

        <div className="space-y-3">
          {recentAlerts.map((alert) => {
            const severityColor =
              alert.severity === 'CRITICAL' ? 'bg-red-500' :
              alert.severity === 'HIGH' ? 'bg-orange-500' :
              alert.severity === 'MEDIUM' ? 'bg-yellow-500' : 'bg-green-500';

            const statusColor =
              alert.status === 'OPEN' ? 'bg-red-500/20 text-red-400' :
              alert.status === 'IN_PROGRESS' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-green-500/20 text-green-400';

            return (
              <div key={alert.id} className="glass-card p-4 flex items-center justify-between hover:scale-[1.01] transition-transform">
                <div className="flex items-center space-x-4 flex-1">
                  <div className={`w-1 h-12 ${severityColor} rounded-full`} />
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">{alert.title}</h4>
                    <div className="flex items-center space-x-3 mt-1">
                      <Badge variant="outline" className={`text-xs ${severityColor} text-white border-0`}>
                        {alert.severity}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>Hace {alert.time}</span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge className={`${statusColor} border-0`}>
                    {alert.status}
                  </Badge>
                  <Button variant="outline" size="sm" className="glass-card">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Trends */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="premium-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-foreground">Tendencia Diaria</h4>
            <TrendingUp className="h-5 w-5 text-green-400" />
          </div>
          <p className="text-3xl font-bold text-green-400">+12%</p>
          <p className="text-sm text-muted-foreground mt-2">vs. ayer</p>
        </div>

        <div className="premium-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-foreground">Tendencia Semanal</h4>
            <TrendingDown className="h-5 w-5 text-red-400" />
          </div>
          <p className="text-3xl font-bold text-red-400">-5%</p>
          <p className="text-sm text-muted-foreground mt-2">vs. semana pasada</p>
        </div>

        <div className="premium-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-foreground">Tendencia Mensual</h4>
            <TrendingUp className="h-5 w-5 text-blue-400" />
          </div>
          <p className="text-3xl font-bold text-blue-400">+8%</p>
          <p className="text-sm text-muted-foreground mt-2">vs. mes pasado</p>
        </div>
      </div>
    </div>
  );
}
