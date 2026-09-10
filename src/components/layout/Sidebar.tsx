import React from 'react';
import { 
  Home, Compass, Gamepad2, Hammer, User, Package, Users, 
  Globe2, Calendar, MessageSquare, Bell, Settings, HelpCircle, Shield, SlidersHorizontal
} from 'lucide-react';
import { NavigationTab } from '../../types';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  unreadMessagesCount: number;
  unreadNotificationsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  unreadMessagesCount,
  unreadNotificationsCount,
}) => {
  const navItems: { id: NavigationTab; label: string; icon: React.FC<{ className?: string }>; badge?: number }[] = [
    { id: 'HOME', label: 'Home', icon: Home },
    { id: 'DISCOVER', label: 'Discover', icon: Compass },
    { id: 'PLAY', label: 'Play Worlds', icon: Gamepad2 },
    { id: 'CREATE', label: 'ACADO Studio', icon: Hammer },
    { id: 'AVATAR', label: '3D Avatar', icon: User },
    { id: 'INVENTORY', label: 'Inventory', icon: Package },
    { id: 'FRIENDS', label: 'Friends', icon: Users },
    { id: 'COMMUNITIES', label: 'Communities', icon: Globe2 },
    { id: 'EVENTS', label: 'Events', icon: Calendar },
    { id: 'MESSAGES', label: 'Messages', icon: MessageSquare, badge: unreadMessagesCount },
    { id: 'NOTIFICATIONS', label: 'Notifications', icon: Bell, badge: unreadNotificationsCount },
    { id: 'CREATOR_DASHBOARD', label: 'Creator Hub', icon: SlidersHorizontal },
    { id: 'SETTINGS', label: 'Settings', icon: Settings },
    { id: 'HELP', label: 'Help', icon: HelpCircle },
    { id: 'ADMIN', label: 'Admin', icon: Shield },
  ];

  return (
    <aside className="w-60 bg-slate-900 border-r border-slate-800 flex flex-col justify-between p-3 select-none flex-shrink-0 hidden md:flex">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
          Universe Navigation
        </div>
        <nav className="space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-xs transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-cyan-300 border border-cyan-500/40 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && item.badge > 0 ? (
                  <span className="px-1.5 py-0.5 rounded-full bg-cyan-500 text-slate-950 text-[10px] font-bold">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer info box */}
      <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50 text-center">
        <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>ACADO Engine v1.0</span>
        </div>
        <p className="text-[10px] text-slate-400 mt-1">Multiplayer Server Latency: 22ms</p>
      </div>
    </aside>
  );
};
