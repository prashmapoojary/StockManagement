import { createContext, useContext, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (user) {
      const newSocket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');
      setSocket(newSocket);

      newSocket.on('connect', () => {
        console.log('Socket connected');
      });

      newSocket.on('notification:new', (data) => {
        // Play notification sound
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play().catch(e => console.log('Audio play failed:', e));

        // Invalidate notifications query
        queryClient.invalidateQueries(['notifications']);
        
        toast(data.message, {
          icon: '🔔',
          style: {
            borderRadius: '0.25rem',
            background: 'oklch(0.6180 0.0778 65.5444)',
            color: '#fff',
          },
        });
      });

      return () => newSocket.close();
    }
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
