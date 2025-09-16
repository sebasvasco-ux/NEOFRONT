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
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={cn(
      "border-r bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 transition-all duration-300",
      isCollapsed ? "w-16" : "w-64",
      className
    )}>
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex h-16 items-center border-b px-4">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">NEOIA</h1>
                <p className="text-xs text-slate-600 dark:text-slate-400">Monitor Transaccional</p>
              </div>
            </div>
          )}
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
                    isActive && "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700",
                    !isActive && "hover:bg-slate-200 dark:hover:bg-slate-700",
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
          <div className="border-t p-4">
            <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
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
          </div>
        )}
      </div>
    </div>
  );
}

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}