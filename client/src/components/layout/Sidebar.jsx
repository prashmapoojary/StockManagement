import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ArrowRightLeft, 
  Bell, 
  Settings, 
  LogOut,
  Warehouse
} from 'lucide-react';
import { useAuth } from '../../hooks';
import { clsx } from 'clsx';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user, logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Inventory', path: '/inventory', icon: Package },
    { name: 'Movements', path: '/movements', icon: ArrowRightLeft },
    { name: 'Notifications', path: '/notifications', icon: Bell },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className={clsx(
      "bg-card border-r border-border transition-all duration-300 flex flex-col",
      isOpen ? "w-64" : "w-20"
    )}>
      <div className="p-6 flex items-center gap-3 border-b border-border h-16">
        <div className="bg-primary p-1.5 rounded-[0.25rem]">
          <Warehouse className="w-6 h-6 text-primary-foreground" />
        </div>
        {isOpen && <span className="font-sans font-bold text-xl text-primary tracking-tight">WMS</span>}
      </div>

      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => clsx(
              "flex items-center gap-3 px-3 py-2.5 rounded-[0.25rem] transition-colors font-sans",
              isActive 
                ? "bg-accent/30 text-primary border-l-4 border-primary" 
                : "text-muted-foreground hover:bg-muted hover:text-foreground border-l-4 border-transparent"
            )}
          >
            <item.icon className="w-5 h-5 shrink-0" />
            {isOpen && <span className="font-medium text-sm">{item.name}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-border mt-auto">
        <div className={clsx("flex items-center gap-3", !isOpen && "justify-center")}>
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0 border border-border">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt={user.name} className="w-full h-full rounded-full" />
            ) : (
              <span className="text-primary font-bold font-sans uppercase">{user?.name?.charAt(0)}</span>
            )}
          </div>
          {isOpen && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate text-foreground">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate uppercase tracking-tighter">{user?.role}</p>
            </div>
          )}
          {isOpen && (
            <button 
              onClick={logout}
              className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
