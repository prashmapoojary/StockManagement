import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Menu, Search, Bell, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import { useAuth, useSocket } from '../../hooks';
import Input from '../ui/Input';
import Button from '../ui/Button';
import beepSound from '../../assets/beep.mp3';

const TopBar = ({ toggleSidebar }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const audioRef = useRef(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isShaking, setIsShaking] = useState(false);
  const { socket } = useSocket();

  // Fetch initial unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await axios.get('/notifications?is_read=false');
      setUnreadCount(res.data.data.unreadCount || 0);
    } catch (err) {
      console.error('Unread count error:', err);
    }
  }, []);

  // Pre-load audio on mount
  useEffect(() => {
    audioRef.current = new Audio(beepSound);
    audioRef.current.volume = 0.6;
    audioRef.current.load();
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  // Trigger shake + beep
  const triggerBellAlert = useCallback(() => {
    // Play beep sound
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {
        // Safe to ignore autoplay block
      });
    }

    // Trigger CSS shake animation
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 900);

    // Increment badge count
    setUnreadCount(prev => prev + 1);
  }, []);

  // Real-time socket events
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (data) => {
      console.log('🔔 New notification:', data);
      triggerBellAlert();
    };

    socket.on('notification:new', handleNewNotification);
    socket.on('stock:low', handleNewNotification);
    socket.on('stock:out', handleNewNotification);

    return () => {
      socket.off('notification:new', handleNewNotification);
      socket.off('stock:low', handleNewNotification);
      socket.off('stock:out', handleNewNotification);
    };
  }, [socket, triggerBellAlert]);

  const handleBellClick = () => {
    navigate('/notifications');
  };

  return (
    <header className="bg-card border-b border-border h-16 flex items-center justify-between px-4 md:px-6 shadow-sm z-10 shrink-0">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="p-2 text-muted-foreground hover:bg-muted rounded-[0.25rem] md:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <div className="hidden md:block w-72 lg:w-96 relative">
          <Input 
            placeholder="Search products, SKU, movements..." 
            className="pl-10 h-9 bg-muted/30"
          />
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <button
          onClick={handleBellClick}
          className="relative p-2 rounded hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <span className={isShaking ? 'bell-shake' : ''}>
            <Bell className={`w-5 h-5 transition-colors ${unreadCount > 0 ? 'text-primary' : 'text-muted-foreground'}`} />
          </span>
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-destructive text-destructive-foreground text-[10px] font-bold font-mono rounded-full flex items-center justify-center px-1 animate-pulse">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
        
        <div className="h-8 w-px bg-border mx-1"></div>
        
        <div className="flex items-center gap-3">
          <div className="hidden md:block text-right">
            <p className="text-sm font-bold text-foreground leading-none">{user?.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5 uppercase tracking-tighter font-serif">Logged in as {user?.role}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs border border-white/20">
            {user?.name?.charAt(0)}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
