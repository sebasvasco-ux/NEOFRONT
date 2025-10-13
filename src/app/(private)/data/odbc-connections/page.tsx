"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Plus,
  Download,
  RefreshCw,
  Database,
  CheckCircle,
  XCircle,
  Play,
  Edit,
  Trash2,
  Wifi
} from 'lucide-react';

const demoConnections = [
  { id: '1', name: 'SQL Server - Producción', type: 'SQL Server', host: 'sql-prod.company.com', port: 1433, database: 'TransactionDB', user: 'admin', status: 'connected', lastTest: '2024-01-15T14:30:00Z' },
  { id: '2', name: 'Oracle - Data Warehouse', type: 'Oracle', host: 'oracle-dw.company.com', port: 1521, database: 'DW_SPECTRA', user: 'dw_user', status: 'connected', lastTest: '2024-01-15T14:25:00Z' },
  { id: '3', name: 'PostgreSQL - Analytics', type: 'PostgreSQL', host: 'postgres-analytics.company.com', port: 5432, database: 'analytics_db', user: 'analytics', status: 'disconnected', lastTest: '2024-01-15T10:00:00Z' },
  { id: '4', name: 'MySQL - Legacy System', type: 'MySQL', host: 'mysql-legacy.company.com', port: 3306, database: 'legacy_trans', user: 'root', status: 'connected', lastTest: '2024-01-15T14:20:00Z' }
];

export default function ODBCConnections() {
  const [connections, setConnections] = useState(demoConnections);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newConnection, setNewConnection] = useState({
    name: '', type: 'SQL Server', host: '', port: '1433', database: '', user: '', password: ''
  });

  const createConnection = () => {
    const connection = {
      id: String(connections.length + 1),
      ...newConnection,
      port: parseInt(newConnection.port),
      status: 'disconnected' as const,
      lastTest: new Date().toISOString()
    };
    setConnections([...connections, connection]);
    setIsCreateDialogOpen(false);
    setNewConnection({ name: '', type: 'SQL Server', host: '', port: '1433', database: '', user: '', password: '' });
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-cyan-400 flex items-center justify-center">
              <Database className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
              Conexiones ODBC
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Gestión de conexiones a bases de datos
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" className="glass-card hover:scale-105 transition-transform">
            <RefreshCw className="h-4 w-4 mr-2" />
            Probar Todas
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gradient-btn hover:scale-105 transition-transform">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Conexión
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg premium-card">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold text-foreground">Nueva Conexión ODBC</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Configura una nueva conexión a base de datos
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Nombre de Conexión</Label>
                  <Input value={newConnection.name} onChange={(e) => setNewConnection({...newConnection, name: e.target.value})} placeholder="Mi Conexión" className="modern-input" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Tipo de Base de Datos</Label>
                    <Select value={newConnection.type} onValueChange={(value) => setNewConnection({...newConnection, type: value})}>
                      <SelectTrigger className="modern-input">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SQL Server">SQL Server</SelectItem>
                        <SelectItem value="Oracle">Oracle</SelectItem>
                        <SelectItem value="PostgreSQL">PostgreSQL</SelectItem>
                        <SelectItem value="MySQL">MySQL</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Puerto</Label>
                    <Input value={newConnection.port} onChange={(e) => setNewConnection({...newConnection, port: e.target.value})} placeholder="1433" className="modern-input" />
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Host</Label>
                  <Input value={newConnection.host} onChange={(e) => setNewConnection({...newConnection, host: e.target.value})} placeholder="localhost" className="modern-input" />
                </div>
                <div>
                  <Label className="text-sm font-medium">Base de Datos</Label>
                  <Input value={newConnection.database} onChange={(e) => setNewConnection({...newConnection, database: e.target.value})} placeholder="mydb" className="modern-input" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Usuario</Label>
                    <Input value={newConnection.user} onChange={(e) => setNewConnection({...newConnection, user: e.target.value})} placeholder="admin" className="modern-input" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Contraseña</Label>
                    <Input type="password" value={newConnection.password} onChange={(e) => setNewConnection({...newConnection, password: e.target.value})} placeholder="••••••" className="modern-input" />
                  </div>
                </div>
                <div className="flex justify-end space-x-3">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="glass-card">Cancelar</Button>
                  <Button onClick={createConnection} className="gradient-btn"><Plus className="h-4 w-4 mr-2" />Crear Conexión</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-slide-in-left">
        <div className="premium-card p-6 hover:scale-105 transition-transform duration-300">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-muted-foreground">Total Conexiones</p><p className="text-3xl font-bold text-foreground mt-2">{connections.length}</p></div>
            <Database className="h-10 w-10 text-teal-400" />
          </div>
        </div>
        <div className="premium-card p-6 hover:scale-105 transition-transform duration-300">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-muted-foreground">Conectadas</p><p className="text-3xl font-bold text-green-400 mt-2">{connections.filter(c => c.status === 'connected').length}</p></div>
            <CheckCircle className="h-10 w-10 text-green-400" />
          </div>
        </div>
        <div className="premium-card p-6 hover:scale-105 transition-transform duration-300">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-muted-foreground">Desconectadas</p><p className="text-3xl font-bold text-red-400 mt-2">{connections.filter(c => c.status === 'disconnected').length}</p></div>
            <XCircle className="h-10 w-10 text-red-400" />
          </div>
        </div>
        <div className="premium-card p-6 hover:scale-105 transition-transform duration-300">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-muted-foreground">Uptime</p><p className="text-3xl font-bold text-blue-400 mt-2">98%</p></div>
            <Wifi className="h-10 w-10 text-blue-400" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 animate-slide-in-left">
        {connections.map((conn) => (
          <div key={conn.id} className="premium-card p-6 hover:scale-[1.01] transition-transform duration-300">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <Database className="h-6 w-6 text-teal-400" />
                  <h3 className="text-xl font-semibold text-foreground">{conn.name}</h3>
                  <Badge variant="outline" className={`${conn.status === 'connected' ? 'bg-green-500' : 'bg-red-500'} text-white border-0`}>
                    {conn.status === 'connected' ? 'Conectada' : 'Desconectada'}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div><span className="text-xs text-muted-foreground">Tipo</span><p className="text-sm font-medium text-foreground">{conn.type}</p></div>
                  <div><span className="text-xs text-muted-foreground">Host</span><p className="text-sm font-medium text-foreground">{conn.host}</p></div>
                  <div><span className="text-xs text-muted-foreground">Puerto</span><p className="text-sm font-medium text-foreground">{conn.port}</p></div>
                  <div><span className="text-xs text-muted-foreground">Base de Datos</span><p className="text-sm font-medium text-foreground">{conn.database}</p></div>
                </div>
              </div>
              <div className="flex space-x-2 ml-4">
                <Button variant="outline" size="sm" className="glass-card hover:scale-105 transition-transform"><Play className="h-4 w-4" /></Button>
                <Button variant="outline" size="sm" className="glass-card hover:scale-105 transition-transform"><Edit className="h-4 w-4" /></Button>
                <Button variant="outline" size="sm" className="glass-card hover:scale-105 transition-transform text-red-400"><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
