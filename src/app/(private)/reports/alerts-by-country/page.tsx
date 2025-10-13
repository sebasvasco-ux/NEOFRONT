"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Download,
  RefreshCw,
  Globe,
  TrendingUp,
  AlertTriangle,
  MapPin
} from 'lucide-react';

// Datos demo de alertas por país
const demoCountryData = [
  { country: 'México', code: 'MX', alerts: 145, critical: 23, high: 45, medium: 52, low: 25, trend: 12 },
  { country: 'Estados Unidos', code: 'US', alerts: 132, critical: 18, high: 41, medium: 48, low: 25, trend: -5 },
  { country: 'Colombia', code: 'CO', alerts: 98, critical: 15, high: 32, medium: 35, low: 16, trend: 8 },
  { country: 'España', code: 'ES', alerts: 87, critical: 12, high: 28, medium: 32, low: 15, trend: 3 },
  { country: 'Brasil', code: 'BR', alerts: 76, critical: 10, high: 24, medium: 28, low: 14, trend: -2 },
  { country: 'Argentina', code: 'AR', alerts: 65, critical: 8, high: 20, medium: 25, low: 12, trend: 15 },
  { country: 'Chile', code: 'CL', alerts: 54, critical: 6, high: 17, medium: 21, low: 10, trend: 5 },
  { country: 'Perú', code: 'PE', alerts: 43, critical: 5, high: 14, medium: 17, low: 7, trend: -3 }
];

const severityColors = {
  critical: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-yellow-500',
  low: 'bg-green-500'
};

export default function AlertsByCountry() {
  const [countryData] = useState(demoCountryData);

  const totalAlerts = countryData.reduce((sum, c) => sum + c.alerts, 0);
  const totalCritical = countryData.reduce((sum, c) => sum + c.critical, 0);
  const avgAlertsPerCountry = Math.round(totalAlerts / countryData.length);
  const highestRiskCountry = countryData[0];

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-400 bg-clip-text text-transparent">
              Alertas por País
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Análisis geográfico de alertas de seguridad
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

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-slide-in-left">
        <div className="premium-card p-6 hover:scale-105 transition-transform duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Alertas</p>
              <p className="text-3xl font-bold text-foreground mt-2">{totalAlerts}</p>
            </div>
            <AlertTriangle className="h-10 w-10 text-blue-400" />
          </div>
        </div>

        <div className="premium-card p-6 hover:scale-105 transition-transform duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Alertas Críticas</p>
              <p className="text-3xl font-bold text-red-400 mt-2">{totalCritical}</p>
            </div>
            <AlertTriangle className="h-10 w-10 text-red-400" />
          </div>
        </div>

        <div className="premium-card p-6 hover:scale-105 transition-transform duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Promedio/País</p>
              <p className="text-3xl font-bold text-yellow-400 mt-2">{avgAlertsPerCountry}</p>
            </div>
            <TrendingUp className="h-10 w-10 text-yellow-400" />
          </div>
        </div>

        <div className="premium-card p-6 hover:scale-105 transition-transform duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Mayor Riesgo</p>
              <p className="text-2xl font-bold text-orange-400 mt-2">{highestRiskCountry.code}</p>
            </div>
            <MapPin className="h-10 w-10 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Country Ranking */}
      <div className="premium-card p-6 animate-fade-in-up">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-foreground">
            Ranking por País
          </h3>
          <Badge variant="outline" className="text-sm">
            {countryData.length} países
          </Badge>
        </div>

        <div className="space-y-4">
          {countryData.map((country, index) => {
            const maxAlerts = countryData[0].alerts;
            const percentage = (country.alerts / maxAlerts) * 100;

            return (
              <div key={country.code} className="glass-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 text-white font-bold">
                      #{index + 1}
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-foreground">{country.country}</h4>
                      <p className="text-sm text-muted-foreground">Código: {country.code}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-foreground">{country.alerts}</p>
                    <div className="flex items-center space-x-1 text-sm">
                      {country.trend > 0 ? (
                        <>
                          <TrendingUp className="h-3 w-3 text-red-400" />
                          <span className="text-red-400">+{country.trend}%</span>
                        </>
                      ) : (
                        <>
                          <TrendingUp className="h-3 w-3 text-green-400 rotate-180" />
                          <span className="text-green-400">{country.trend}%</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>

                {/* Severity Breakdown */}
                <div className="grid grid-cols-4 gap-3">
                  <div className="text-center">
                    <div className={`w-full h-2 ${severityColors.critical} rounded-full mb-1`} />
                    <p className="text-xs text-muted-foreground">Críticas</p>
                    <p className="text-sm font-bold text-red-400">{country.critical}</p>
                  </div>
                  <div className="text-center">
                    <div className={`w-full h-2 ${severityColors.high} rounded-full mb-1`} />
                    <p className="text-xs text-muted-foreground">Altas</p>
                    <p className="text-sm font-bold text-orange-400">{country.high}</p>
                  </div>
                  <div className="text-center">
                    <div className={`w-full h-2 ${severityColors.medium} rounded-full mb-1`} />
                    <p className="text-xs text-muted-foreground">Medias</p>
                    <p className="text-sm font-bold text-yellow-400">{country.medium}</p>
                  </div>
                  <div className="text-center">
                    <div className={`w-full h-2 ${severityColors.low} rounded-full mb-1`} />
                    <p className="text-xs text-muted-foreground">Bajas</p>
                    <p className="text-sm font-bold text-green-400">{country.low}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Distribution Chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="premium-card p-6">
          <h3 className="text-xl font-semibold text-foreground mb-6">
            Distribución por Severidad
          </h3>
          <div className="space-y-4">
            {[
              { label: 'Críticas', value: totalCritical, color: 'bg-red-500', percentage: (totalCritical / totalAlerts * 100).toFixed(1) },
              { label: 'Altas', value: countryData.reduce((sum, c) => sum + c.high, 0), color: 'bg-orange-500', percentage: (countryData.reduce((sum, c) => sum + c.high, 0) / totalAlerts * 100).toFixed(1) },
              { label: 'Medias', value: countryData.reduce((sum, c) => sum + c.medium, 0), color: 'bg-yellow-500', percentage: (countryData.reduce((sum, c) => sum + c.medium, 0) / totalAlerts * 100).toFixed(1) },
              { label: 'Bajas', value: countryData.reduce((sum, c) => sum + c.low, 0), color: 'bg-green-500', percentage: (countryData.reduce((sum, c) => sum + c.low, 0) / totalAlerts * 100).toFixed(1) }
            ].map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">{item.label}</span>
                  <span className="text-sm font-bold text-foreground">{item.value} ({item.percentage}%)</span>
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
        </div>

        <div className="premium-card p-6">
          <h3 className="text-xl font-semibold text-foreground mb-6">
            Top 5 Países
          </h3>
          <div className="space-y-4">
            {countryData.slice(0, 5).map((country, index) => (
              <div key={country.code} className="flex items-center justify-between p-3 glass-card">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 text-white text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{country.country}</p>
                    <p className="text-xs text-muted-foreground">{country.code}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-foreground">{country.alerts}</p>
                  <p className="text-xs text-muted-foreground">alertas</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
