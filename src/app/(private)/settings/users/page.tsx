"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, Users, Shield, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';

const demoUsers = [
  { id: '1', name: 'Ana García', email: 'ana.garcia@spectra.com', role: 'Admin', status: 'active', lastLogin: '2024-01-15T14:30:00Z' },
  { id: '2', name: 'Carlos Rodríguez', email: 'carlos.rodriguez@spectra.com', role: 'Analista', status: 'active', lastLogin: '2024-01-15T13:20:00Z' },
  { id: '3', name: 'María López', email: 'maria.lopez@spectra.com', role: 'Investigador', status: 'active', lastLogin: '2024-01-15T12:10:00Z' },
  { id: '4', name: 'Juan Pérez', email: 'juan.perez@spectra.com', role: 'Viewer', status: 'inactive', lastLogin: '2024-01-10T09:00:00Z' }
];

export default function UsersSettings() {
  const [users, setUsers] = useState(demoUsers);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'Viewer' });

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const createUser = () => {
    const user = { id: String(users.length + 1), ...newUser, status: 'active' as const, lastLogin: new Date().toISOString() };
    setUsers([...users, user]);
    setIsCreateDialogOpen(false);
    setNewUser({ name: '', email: '', role: 'Viewer' });
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-purple-400 flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-400 via-purple-300 to-fuchsia-400 bg-clip-text text-transparent">
              Usuarios y Permisos
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">Gestión de usuarios y roles</p>
          </div>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gradient-btn hover:scale-105 transition-transform">
              <Plus className="h-4 w-4 mr-2" />Nuevo Usuario
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg premium-card">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-foreground">Crear Nuevo Usuario</DialogTitle>
              <DialogDescription className="text-muted-foreground">Agrega un nuevo usuario al sistema</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Nombre Completo</Label>
                <Input value={newUser.name} onChange={(e) => setNewUser({...newUser, name: e.target.value})} placeholder="Juan Pérez" className="modern-input" />
              </div>
              <div>
                <Label className="text-sm font-medium">Email</Label>
                <Input value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} placeholder="juan.perez@spectra.com" className="modern-input" />
              </div>
              <div>
                <Label className="text-sm font-medium">Rol</Label>
                <Select value={newUser.role} onValueChange={(value) => setNewUser({...newUser, role: value})}>
                  <SelectTrigger className="modern-input"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Administrador</SelectItem>
                    <SelectItem value="Analista">Analista</SelectItem>
                    <SelectItem value="Investigador">Investigador</SelectItem>
                    <SelectItem value="Viewer">Visualizador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="glass-card">Cancelar</Button>
                <Button onClick={createUser} className="gradient-btn"><Plus className="h-4 w-4 mr-2" />Crear Usuario</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-slide-in-left">
        <div className="premium-card p-6 hover:scale-105 transition-transform duration-300">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-muted-foreground">Total Usuarios</p><p className="text-3xl font-bold text-foreground mt-2">{users.length}</p></div>
            <Users className="h-10 w-10 text-violet-400" />
          </div>
        </div>
        <div className="premium-card p-6 hover:scale-105 transition-transform duration-300">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-muted-foreground">Activos</p><p className="text-3xl font-bold text-green-400 mt-2">{users.filter(u => u.status === 'active').length}</p></div>
            <CheckCircle className="h-10 w-10 text-green-400" />
          </div>
        </div>
        <div className="premium-card p-6 hover:scale-105 transition-transform duration-300">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-muted-foreground">Inactivos</p><p className="text-3xl font-bold text-red-400 mt-2">{users.filter(u => u.status === 'inactive').length}</p></div>
            <XCircle className="h-10 w-10 text-red-400" />
          </div>
        </div>
        <div className="premium-card p-6 hover:scale-105 transition-transform duration-300">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-muted-foreground">Admins</p><p className="text-3xl font-bold text-purple-400 mt-2">{users.filter(u => u.role === 'Admin').length}</p></div>
            <Shield className="h-10 w-10 text-purple-400" />
          </div>
        </div>
      </div>

      <div className="premium-card p-6">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar usuarios por nombre o email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 modern-input" />
        </div>

        <div className="space-y-3">
          {filteredUsers.map((user) => (
            <div key={user.id} className="glass-card p-5 hover:scale-[1.01] transition-transform">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-purple-400 flex items-center justify-center text-white font-bold">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">{user.name}</h4>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <Badge variant="outline" className={`${user.status === 'active' ? 'bg-green-500' : 'bg-red-500'} text-white border-0`}>
                    {user.status === 'active' ? 'Activo' : 'Inactivo'}
                  </Badge>
                  <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-0">
                    {user.role}
                  </Badge>
                </div>
                <div className="flex space-x-2 ml-4">
                  <Button variant="outline" size="sm" className="glass-card hover:scale-105 transition-transform"><Edit className="h-4 w-4" /></Button>
                  <Button variant="outline" size="sm" className="glass-card hover:scale-105 transition-transform text-red-400"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
