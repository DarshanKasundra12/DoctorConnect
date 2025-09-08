import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  FileText, 
  CreditCard, 
  Video, 
  Settings, 
  Home,
  Menu,
  X,
  Stethoscope 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import doctorConnectLogo from '@/assets/doctor-connect-logo.png';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: Home },
  { title: 'Appointments', href: '/appointments', icon: Calendar },
  { title: 'Patients', href: '/patients', icon: Users },
  { title: 'Prescriptions', href: '/prescriptions', icon: FileText },
  { title: 'Billing', href: '/billing', icon: CreditCard },
  { title: 'Teleconsult', href: '/teleconsult', icon: Video },
  { title: 'Settings', href: '/settings', icon: Settings },
];

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar = ({ isOpen, onToggle }: SidebarProps) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <aside className={cn(
        "h-full bg-card border-r border-border transition-all duration-300",
        "w-64 flex-shrink-0",
        "lg:block", // Always visible on desktop
        // Mobile positioning
        "fixed top-0 left-0 z-50 lg:relative lg:z-auto",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <img 
              src={doctorConnectLogo} 
              alt="DoctorConnect" 
              className="h-8 w-8"
            />
            <div>
              <h1 className="font-bold text-lg text-primary">DoctorConnect</h1>
              <p className="text-xs text-muted-foreground">Healthcare Management</p>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onToggle}
            className="lg:hidden"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <NavLink
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                      isActive(item.href) 
                        ? "bg-primary text-primary-foreground shadow-sm" 
                        : "text-foreground"
                    )}
                    onClick={() => window.innerWidth < 1024 && onToggle()}
                  >
                    <Icon className="h-4 w-4" />
                    {item.title}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;