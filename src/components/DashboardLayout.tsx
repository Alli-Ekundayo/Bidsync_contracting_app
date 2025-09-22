
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  LayoutDashboard, 
  Target, 
  FileText, 
  Bot, 
  Settings, 
  LogOut,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Opportunities", href: "/opportunities", icon: Target },
    { name: "Proposals", href: "/proposals", icon: FileText },
    { name: "AI Consultant", href: "/ai-consultant", icon: Bot },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    } else {
      navigate("/signin");
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 bg-card shadow-lg transform lg:relative lg:translate-x-0 lg:z-auto lg:shadow-none lg:border-r ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${collapsed ? 'w-20' : 'w-64'} sidebar-transition`}
        aria-hidden={!sidebarOpen && !collapsed}
        data-collapsed={collapsed}
      >
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <Link to="/dashboard" className="flex items-center" aria-label="Home">
              <Building2 className={`h-7 w-7 text-accent ${collapsed ? 'mx-auto' : ''}`} />
              <span
                className={`ml-2 text-xl font-bold text-foreground transition-opacity duration-200 ${
                  collapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'
                }`}
              >
                BidSync
              </span>
            </Link>
            <span className={`ml-2 text-sm text-muted-foreground transition-opacity duration-200 ${collapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
              Contracting
            </span>
          </div>

          <div className="flex items-center gap-2">
                <button
                  aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                  className="p-2 rounded-md hover:bg-muted/50"
                  onClick={() => setCollapsed((v) => !v)}
                >
                  {collapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
                </button>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <nav className="p-6">
          <ul className="space-y-2">
            {navigation.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={`flex items-center transition-colors text-sm font-medium rounded-lg ${
                    isActive(item.href)
                      ? 'bg-accent/10 text-accent-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-foreground'
                  } ${collapsed ? 'justify-center px-0 py-3' : 'px-4 py-2'}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className={`h-5 w-5 ${isActive(item.href) ? 'text-accent' : 'text-sidebar-foreground'}`} />
                  <span className={`ml-3 transition-opacity duration-200 ${collapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                    {item.name}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <div className="flex items-center justify-between">
            <div className={`flex items-center space-x-3 transition-opacity duration-200 ${collapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
              <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-sm font-medium text-foreground">U</div>
              <div>
                <div className="text-sm font-medium text-foreground">Account</div>
                <div className="text-xs text-muted-foreground">Manage settings</div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <ThemeToggle />
              <button
                className="text-muted-foreground hover:text-foreground p-2 rounded-md"
                onClick={handleSignOut}
                aria-label="Sign out"
                title="Sign out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="bg-card shadow-sm border-b px-4 py-3 lg:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <Link to="/dashboard" className="flex items-center" aria-label="Home">
                <Building2 className="h-6 w-6 text-accent" />
                <span className="ml-2 text-lg font-medium text-foreground">BidSync</span>
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <input
                placeholder="Search opportunities"
                className="input hidden sm:inline-block w-48"
                aria-label="Search"
              />
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
