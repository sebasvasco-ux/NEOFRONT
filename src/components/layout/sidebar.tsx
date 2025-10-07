"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutDashboard, 
  Settings, 
  AlertTriangle, 
  FileText, 
  Workflow, 
  Database, 
  BarChart3,
  Shield,
  Bell,
  CreditCard,
  Users,
  ChevronLeft,
  ChevronRight,
  Home
} from 'lucide-react';
import { useCallback, useState as useClientState } from 'react';

const navigation = [
  {
    name: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    description: 'Vista general y estadísticas'
  },
  {
    name: 'Transacciones',
    href: '/transactions',
    icon: CreditCard,
    description: 'Gestión de transacciones'
  },
  {
    name: 'Alertas',
    href: '/alerts',
    icon: AlertTriangle,
    description: 'Monitoreo de alertas'
  },
  {
    name: 'Reglas',
    href: '/rules',
    icon: Shield,
    description: 'Configuración de reglas'
  },
  {
    name: 'Reportes',
    href: '/reports',
    icon: FileText,
    description: 'Generación de reportes'
  },
  {
    name: 'Workflows',
    href: '/workflows',
    icon: Workflow,
    description: 'Diseño de workflows'
  },
  {
    name: 'Datos',
    href: '/data',
    icon: Database,
    description: 'Gestión de datos'
  },
  {
    name: 'Configuración',
    href: '/settings',
    icon: Settings,
    description: 'Configuración general'
  }
];

interface SidebarProps {
  className?: string;
  user?: { sub?: string; email?: string };
}

export function Sidebar({ className, user }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={cn(
      "border-r bg-gradient-to-b from-sidebar to-sidebar-accent transition-all duration-300",
      isCollapsed ? "w-16" : "w-64",
      className
    )}>
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex h-16 items-center border-b px-4">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <img src="/Spectra.png" alt="Spectra" className="w-8 h-8" />
              <div>
                <h1 className="text-lg font-bold text-foreground">SPECTRA DC</h1>
                <p className="text-xs text-muted-foreground">Monitor Transaccional</p>
              </div>
            </div>
          )}
          {isCollapsed && (
            <div className="flex items-center justify-center w-full">
              <img src="/CuboSpectra.png" alt="Spectra DC" className="w-10 h-10" />
            </div>
          )}
          {!isCollapsed && (
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const IconComponent = item.icon;

            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start transition-all duration-200",
                    isActive && "bg-primary text-primary-foreground hover:bg-primary/90",
                    !isActive && "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    isCollapsed && "justify-center px-2"
                  )}
                >
                  <IconComponent className={cn(
                    "h-5 w-5",
                    !isCollapsed && "mr-3"
                  )} />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 text-left">{item.name}</span>
                      {item.name === 'Alertas' && (
                        <Badge variant="secondary" className="ml-auto bg-red-100 text-red-800">
                          3
                        </Badge>
                      )}
                    </>
                  )}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        {!isCollapsed && (
          <div className="border-t p-4 space-y-4">
            <div className="text-xs text-muted-foreground space-y-1">
              <div className="flex justify-between">
                <span>Versión</span>
                <span className="font-medium">2.0.1</span>
              </div>
              <div className="flex justify-between">
                <span>Estado</span>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="font-medium text-green-600">Activo</span>
                </div>
              </div>
            </div>
            <div className="rounded-md bg-muted p-3 text-xs">
              <p className="font-semibold text-foreground mb-1">Usuario</p>
              {user?.email && <p className="text-muted-foreground truncate">{user.email}</p>}
              {!user?.email && user?.sub && <p className="text-muted-foreground truncate">{user.sub}</p>}
              {!user && <p className="text-muted-foreground italic">(no disponible)</p>}
            </div>
            <LogoutButton />
          </div>
        )}
      </div>
    </div>
  );
}


// Lightweight logout button (placeholder) -- will call server endpoint once implemented
function LogoutButton() {
  const [loading, setLoading] = useClientState(false);
  const onClick = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/oidc/logout', { method: 'POST' });
      if (!res.ok) {
        // swallow for now; could show toast
      }
    } catch (e) {
      // ignore
    } finally {
      window.location.href = '/login';
    }
  }, []);
  return (
    <Button variant="outline" size="sm" className="w-full justify-center" onClick={onClick} disabled={loading}>
      {loading ? 'Saliendo...' : 'Logout'}
    </Button>
  );
}
