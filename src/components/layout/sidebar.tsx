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
  ChevronDown,
  Home,
  LogOut,
  User2,
  Activity,
  List,
  Search,
  CheckCircle
} from 'lucide-react';
import { useCallback } from 'react';

interface MenuItem {
  name: string;
  href?: string;
  icon: any;
  description: string;
  badge?: { count: number; variant: 'default' | 'destructive' } | null;
  children?: MenuItem[];
}

const navigation: MenuItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'Vista general',
    badge: null
  },
  {
    name: 'Transacciones',
    icon: CreditCard,
    description: 'Gestión de transacciones',
    badge: null,
    children: [
      {
        name: 'Consulta de Transacciones',
        href: '/transactions',
        icon: Search,
        description: 'Consultar y filtrar transacciones',
        badge: null
      }
    ]
  },
  {
    name: 'Alertas',
    icon: AlertTriangle,
    description: 'Monitoreo de alertas',
    badge: { count: 3, variant: 'destructive' },
    children: [
      {
        name: 'Visor de Alertas',
        href: '/alerts',
        icon: Bell,
        description: 'Visualizar y gestionar alertas',
        badge: { count: 3, variant: 'destructive' }
      }
    ]
  },
  {
    name: 'Motor de Reglas',
    icon: Shield,
    description: 'Configuración de reglas',
    badge: null,
    children: [
      {
        name: 'Reglas AML',
        href: '/rules/aml',
        icon: Shield,
        description: 'Reglas Anti Lavado de Dinero',
        badge: null
      },
      {
        name: 'Reglas Fraude',
        href: '/rules/fraud',
        icon: AlertTriangle,
        description: 'Reglas de detección de fraude',
        badge: null
      },
      {
        name: 'Reglas Onboarding',
        href: '/rules/onboarding',
        icon: Users,
        description: 'Reglas de onboarding de clientes',
        badge: null
      }
    ]
  },
  {
    name: 'Listas',
    icon: List,
    description: 'Gestión de listas',
    badge: null,
    children: [
      {
        name: 'Adverse Media',
        href: '/lists/adverse-media',
        icon: Search,
        description: 'Búsqueda de medios adversos',
        badge: null
      }
    ]
  },
  {
    name: 'Reportes',
    icon: FileText,
    description: 'Generación de reportes',
    badge: null,
    children: [
      {
        name: 'Condiciones Cumplidas',
        href: '/reports/conditions',
        icon: CheckCircle,
        description: 'Reportes de condiciones cumplidas',
        badge: null
      },
      {
        name: 'Alertas por País',
        href: '/reports/alerts-by-country',
        icon: BarChart3,
        description: 'Análisis de alertas por país',
        badge: null
      },
      {
        name: 'Alertas en Visor',
        href: '/reports/alerts-viewer',
        icon: Activity,
        description: 'Dashboard de alertas',
        badge: null
      }
    ]
  },
  {
    name: 'Workflows',
    icon: Workflow,
    description: 'Diseño de workflows',
    badge: null,
    children: [
      {
        name: 'Workflow de Investigación',
        href: '/workflows/investigation',
        icon: Search,
        description: 'Gestión de investigaciones',
        badge: null
      }
    ]
  },
  {
    name: 'Datos',
    icon: Database,
    description: 'Gestión de datos',
    badge: null,
    children: [
      {
        name: 'Conexiones ODBC',
        href: '/data/odbc-connections',
        icon: Database,
        description: 'Configurar conexiones ODBC',
        badge: null
      }
    ]
  },
  {
    name: 'Configuración',
    icon: Settings,
    description: 'Configuración general',
    badge: null,
    children: [
      {
        name: 'Configuración General',
        href: '/settings/general',
        icon: Settings,
        description: 'Configuración del sistema',
        badge: null
      },
      {
        name: 'Usuarios y Permisos',
        href: '/settings/users',
        icon: Users,
        description: 'Gestión de usuarios',
        badge: null
      }
    ]
  }
];

interface SidebarProps {
  className?: string;
  user?: { sub?: string; email?: string };
}

export function Sidebar({ className, user }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  const toggleMenu = (menuName: string) => {
    setOpenMenus(prev => ({
      ...prev,
      [menuName]: !prev[menuName]
    }));
  };

  // Check if any child is active
  const isChildActive = (children?: MenuItem[]) => {
    if (!children) return false;
    return children.some(child => pathname === child.href);
  };

  return (
    <div className={cn(
      "relative flex flex-col border-r bg-sidebar transition-all duration-300 ease-in-out",
      isCollapsed ? "w-20" : "w-72",
      className
    )}>
      {/* Gradient Accent Border */}
      <div className="absolute inset-y-0 right-0 w-[1px] bg-gradient-to-b from-transparent via-cyan-500/50 to-transparent" />

      {/* Header */}
      <div className="sticky top-0 z-10 backdrop-blur-xl bg-sidebar/95 border-b border-sidebar-border">
        <div className="flex h-16 items-center justify-between px-4">
          {!isCollapsed && (
            <div className="flex items-center space-x-3 flex-1">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/50">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-sidebar animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-base font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent truncate">
                  SPECTRA DC
                </h1>
                <p className="text-xs text-muted-foreground truncate">Monitor Transaccional</p>
              </div>
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 rounded-lg hover:bg-sidebar-accent transition-colors",
              isCollapsed && "mx-auto"
            )}
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4 text-sidebar-foreground" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-sidebar-foreground" />
            )}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin scrollbar-thumb-sidebar-accent scrollbar-track-transparent">
        {navigation.map((item) => {
          const hasChildren = item.children && item.children.length > 0;
          const isActive = pathname === item.href;
          const hasActiveChild = isChildActive(item.children);
          const isMenuOpen = openMenus[item.name] || hasActiveChild;
          const IconComponent = item.icon;

          // Parent menu item (with or without children)
          if (hasChildren) {
            return (
              <div key={item.name}>
                {/* Parent Item */}
                <div
                  onClick={() => !isCollapsed && toggleMenu(item.name)}
                  className={cn(
                    "group relative flex items-center rounded-xl transition-all duration-200 cursor-pointer",
                    isCollapsed ? "justify-center p-3" : "gap-3 px-3 py-2.5",
                    hasActiveChild
                      ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 shadow-lg shadow-cyan-500/10"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  )}
                >
                  {/* Active Indicator */}
                  {hasActiveChild && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-r-full" />
                  )}

                  {/* Icon */}
                  <div className={cn(
                    "relative flex items-center justify-center",
                    isCollapsed ? "w-5 h-5" : "w-5 h-5"
                  )}>
                    <IconComponent className={cn(
                      "transition-all duration-200",
                      hasActiveChild ? "scale-110" : "group-hover:scale-105"
                    )} />
                    {hasActiveChild && (
                      <div className="absolute inset-0 bg-cyan-400/20 rounded-lg blur-md" />
                    )}
                  </div>

                  {!isCollapsed && (
                    <>
                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <div className={cn(
                          "text-sm font-medium transition-colors truncate",
                          hasActiveChild && "font-semibold"
                        )}>
                          {item.name}
                        </div>
                        {!hasActiveChild && (
                          <div className="text-xs text-muted-foreground truncate opacity-0 group-hover:opacity-100 transition-opacity">
                            {item.description}
                          </div>
                        )}
                      </div>

                      {/* Chevron */}
                      <ChevronDown className={cn(
                        "h-4 w-4 transition-transform duration-200",
                        isMenuOpen && "rotate-180"
                      )} />

                      {/* Badge */}
                      {item.badge && (
                        <Badge
                          variant="default"
                          className={cn(
                            "ml-auto h-5 px-2 text-xs font-semibold",
                            item.badge.variant === 'destructive'
                              ? "bg-red-500 text-white hover:bg-red-600"
                              : "bg-cyan-500 text-white"
                          )}
                        >
                          {item.badge.count}
                        </Badge>
                      )}
                    </>
                  )}
                </div>

                {/* Children Items */}
                {!isCollapsed && isMenuOpen && (
                  <div className="ml-4 mt-1 space-y-1 border-l border-sidebar-border pl-2">
                    {item.children?.map((child) => {
                      const isChildItemActive = pathname === child.href;
                      const ChildIconComponent = child.icon;

                      return (
                        <Link key={child.name} href={child.href || '#'}>
                          <div
                            className={cn(
                              "group relative flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200",
                              isChildItemActive
                                ? "bg-gradient-to-r from-cyan-500/15 to-blue-500/15 text-cyan-400"
                                : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                            )}
                          >
                            {/* Icon */}
                            <div className="relative flex items-center justify-center w-4 h-4">
                              <ChildIconComponent className={cn(
                                "transition-all duration-200",
                                isChildItemActive ? "scale-110" : "group-hover:scale-105"
                              )} />
                            </div>

                            {/* Text */}
                            <div className="flex-1 min-w-0">
                              <div className={cn(
                                "text-sm font-medium transition-colors truncate",
                                isChildItemActive && "font-semibold"
                              )}>
                                {child.name}
                              </div>
                            </div>

                            {/* Badge */}
                            {child.badge && (
                              <Badge
                                variant="default"
                                className={cn(
                                  "h-5 px-2 text-xs font-semibold",
                                  child.badge.variant === 'destructive'
                                    ? "bg-red-500 text-white"
                                    : "bg-cyan-500 text-white"
                                )}
                              >
                                {child.badge.count}
                              </Badge>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          // Regular menu item (no children)
          return (
            <Link key={item.name} href={item.href || '#'}>
              <div
                className={cn(
                  "group relative flex items-center rounded-xl transition-all duration-200",
                  isCollapsed ? "justify-center p-3" : "gap-3 px-3 py-2.5",
                  isActive
                    ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 shadow-lg shadow-cyan-500/10"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}
              >
                {/* Active Indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-r-full" />
                )}

                {/* Icon */}
                <div className={cn(
                  "relative flex items-center justify-center",
                  isCollapsed ? "w-5 h-5" : "w-5 h-5"
                )}>
                  <IconComponent className={cn(
                    "transition-all duration-200",
                    isActive ? "scale-110" : "group-hover:scale-105"
                  )} />
                  {isActive && (
                    <div className="absolute inset-0 bg-cyan-400/20 rounded-lg blur-md" />
                  )}
                </div>

                {!isCollapsed && (
                  <>
                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <div className={cn(
                        "text-sm font-medium transition-colors truncate",
                        isActive && "font-semibold"
                      )}>
                        {item.name}
                      </div>
                      {!isActive && (
                        <div className="text-xs text-muted-foreground truncate opacity-0 group-hover:opacity-100 transition-opacity">
                          {item.description}
                        </div>
                      )}
                    </div>

                    {/* Badge */}
                    {item.badge && (
                      <Badge
                        variant="default"
                        className={cn(
                          "ml-auto h-5 px-2 text-xs font-semibold",
                          item.badge.variant === 'destructive'
                            ? "bg-red-500 text-white hover:bg-red-600"
                            : "bg-cyan-500 text-white"
                        )}
                      >
                        {item.badge.count}
                      </Badge>
                    )}
                  </>
                )}

                {/* Tooltip for collapsed state */}
                {isCollapsed && item.badge && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-sidebar" />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="sticky bottom-0 backdrop-blur-xl bg-sidebar/95 border-t border-sidebar-border p-4 space-y-3">
        {!isCollapsed && (
          <>
            {/* System Status */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20">
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                  <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-75" />
                </div>
                <span className="text-xs font-medium text-emerald-400">Sistema Activo</span>
              </div>
              <span className="text-xs text-muted-foreground">v2.0.1</span>
            </div>

            {/* User Info */}
            <div className="p-3 rounded-xl bg-sidebar-accent/50 border border-sidebar-border">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                  <User2 className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">
                    {user?.email?.split('@')[0] || 'Usuario'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email || user?.sub || 'guest@spectra.com'}
                  </p>
                </div>
              </div>
              <LogoutButton />
            </div>
          </>
        )}

        {isCollapsed && (
          <div className="flex flex-col items-center space-y-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center relative">
              <User2 className="w-5 h-5 text-white" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-sidebar" />
            </div>
            <LogoutButton collapsed />
          </div>
        )}
      </div>
    </div>
  );
}

// Lightweight logout button
function LogoutButton({ collapsed }: { collapsed?: boolean }) {
  const [loading, setLoading] = useState(false);

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

  if (collapsed) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="w-9 h-9 rounded-lg hover:bg-red-500/10 hover:text-red-400 transition-colors"
        onClick={onClick}
        disabled={loading}
      >
        <LogOut className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="w-full rounded-lg border-sidebar-border hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-all"
      onClick={onClick}
      disabled={loading}
    >
      <LogOut className="h-4 w-4 mr-2" />
      {loading ? 'Saliendo...' : 'Cerrar Sesión'}
    </Button>
  );
}
