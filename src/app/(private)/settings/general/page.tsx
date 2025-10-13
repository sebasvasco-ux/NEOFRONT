"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Save, RefreshCw, Bell, Shield, Globe, Mail } from 'lucide-react';

export default function GeneralSettings() {
  const [settings, setSettings] = useState({
    siteName: 'SPECTRA DC',
    language: 'es',
    timezone: 'America/Mexico_City',
    emailNotifications: true,
    pushNotifications: false,
    twoFactor: true,
    sessionTimeout: '30',
    maxLoginAttempts: '3'
  });

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex items-center space-x-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-500 to-slate-400 flex items-center justify-center">
            <Settings className="w-6 h-6 text-white" />
          </div>
        </div>
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-400 via-slate-300 to-zinc-400 bg-clip-text text-transparent">
            Configuración General
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">Ajustes generales del sistema</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="premium-card p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Globe className="h-5 w-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-foreground">Configuración Regional</h3>
          </div>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Nombre del Sitio</Label>
              <Input value={settings.siteName} onChange={(e) => setSettings({...settings, siteName: e.target.value})} className="modern-input" />
            </div>
            <div>
              <Label className="text-sm font-medium">Idioma</Label>
              <Select value={settings.language} onValueChange={(value) => setSettings({...settings, language: value})}>
                <SelectTrigger className="modern-input"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="pt">Português</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium">Zona Horaria</Label>
              <Select value={settings.timezone} onValueChange={(value) => setSettings({...settings, timezone: value})}>
                <SelectTrigger className="modern-input"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/Mexico_City">Ciudad de México (GMT-6)</SelectItem>
                  <SelectItem value="America/New_York">New York (GMT-5)</SelectItem>
                  <SelectItem value="Europe/Madrid">Madrid (GMT+1)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="premium-card p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Bell className="h-5 w-5 text-yellow-400" />
            <h3 className="text-lg font-semibold text-foreground">Notificaciones</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 glass-card rounded-lg">
              <div>
                <p className="font-medium text-foreground">Notificaciones por Email</p>
                <p className="text-xs text-muted-foreground">Recibir alertas por correo</p>
              </div>
              <Switch checked={settings.emailNotifications} onCheckedChange={(checked) => setSettings({...settings, emailNotifications: checked})} />
            </div>
            <div className="flex items-center justify-between p-3 glass-card rounded-lg">
              <div>
                <p className="font-medium text-foreground">Notificaciones Push</p>
                <p className="text-xs text-muted-foreground">Alertas en el navegador</p>
              </div>
              <Switch checked={settings.pushNotifications} onCheckedChange={(checked) => setSettings({...settings, pushNotifications: checked})} />
            </div>
          </div>
        </div>

        <div className="premium-card p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Shield className="h-5 w-5 text-green-400" />
            <h3 className="text-lg font-semibold text-foreground">Seguridad</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 glass-card rounded-lg">
              <div>
                <p className="font-medium text-foreground">Autenticación de Dos Factores</p>
                <p className="text-xs text-muted-foreground">Mayor seguridad en el login</p>
              </div>
              <Switch checked={settings.twoFactor} onCheckedChange={(checked) => setSettings({...settings, twoFactor: checked})} />
            </div>
            <div>
              <Label className="text-sm font-medium">Tiempo de Sesión (minutos)</Label>
              <Input type="number" value={settings.sessionTimeout} onChange={(e) => setSettings({...settings, sessionTimeout: e.target.value})} className="modern-input" />
            </div>
            <div>
              <Label className="text-sm font-medium">Intentos Máximos de Login</Label>
              <Input type="number" value={settings.maxLoginAttempts} onChange={(e) => setSettings({...settings, maxLoginAttempts: e.target.value})} className="modern-input" />
            </div>
          </div>
        </div>

        <div className="premium-card p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Mail className="h-5 w-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-foreground">Servidor de Email</h3>
          </div>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Servidor SMTP</Label>
              <Input placeholder="smtp.gmail.com" className="modern-input" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Puerto</Label>
                <Input placeholder="587" className="modern-input" />
              </div>
              <div>
                <Label className="text-sm font-medium">Seguridad</Label>
                <Select defaultValue="tls">
                  <SelectTrigger className="modern-input"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tls">TLS</SelectItem>
                    <SelectItem value="ssl">SSL</SelectItem>
                    <SelectItem value="none">Ninguna</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <Button variant="outline" className="glass-card"><RefreshCw className="h-4 w-4 mr-2" />Restaurar</Button>
        <Button className="gradient-btn"><Save className="h-4 w-4 mr-2" />Guardar Cambios</Button>
      </div>
    </div>
  );
}
