import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Eye, Check, Trash2, AlertCircle, ShoppingCart } from 'lucide-react';
import api from '../api/axios';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../api/notificationApi';
import Button from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';

const Notifications = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await getNotifications();
      return res.data.data;
    }
  });

  const notifications = data?.notifications || [];

  const markReadMutation = useMutation({
    mutationFn: (id) => markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
    }
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      toast.success('All notifications marked as read');
    }
  });

  const handleViewProduct = (n) => {
    // Mark as read first if unread
    if (!n.is_read) {
      markReadMutation.mutate(n.id);
    }
    // Navigate to product detail
    if (n.product_id) {
      navigate(`/inventory/${n.product_id}`);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-sans text-foreground">Alerts Central</h1>
          <p className="text-muted-foreground font-serif italic text-sm mt-1">Manage inventory alerts and system notifications</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => markAllReadMutation.mutate()} className="font-bold">
          <Check className="w-4 h-4 mr-2" /> Mark All Read
        </Button>
      </header>

      <section className="space-y-3">
        {notifications.length > 0 ? (
          notifications.map((n) => (
            <div 
              key={n.id} 
              className={clsx(
                "group relative bg-card border p-5 rounded-[0.25rem] shadow-sm transition-all hover:shadow-md border-l-4",
                n.is_read ? "border-transparent opacity-75" : "border-primary ",
                !n.is_read && "bg-primary/5"
              )}
            >
              <div className="flex items-start gap-4">
                <div className={clsx(
                  "p-3 rounded-[0.25rem]",
                  n.type === 'LOW_STOCK' ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                )}>
                  {n.type === 'LOW_STOCK' ? <AlertCircle className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className={clsx("font-sans font-bold", !n.is_read && "text-primary")}>
                      {n.type === 'LOW_STOCK' ? 'Low Stock Warning' : 'Post-Stockout Alert'}
                    </h4>
                    <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                      {new Date(n.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm font-serif text-foreground leading-relaxed">
                    {n.message}
                  </p>
                  
                  <div className="mt-4 flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!n.is_read && (
                      <Button variant="ghost" size="sm" onClick={() => markReadMutation.mutate(n.id)} className="h-8 text-xs">
                        Mark as read
                      </Button>
                    )}
                    {n.product_id && (
                      <Button 
                        variant="primary" 
                        size="sm" 
                        className="h-8 text-xs font-bold"
                        onClick={() => handleViewProduct(n)}
                      >
                        <Eye className="w-4 h-4 mr-1" /> View Product
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-card border border-border p-12 text-center rounded-[0.25rem] shadow-sm">
            <div className="inline-flex p-4 bg-muted/40 rounded-full mb-4">
              <Bell className="w-8 h-8 text-muted-foreground opacity-50" />
            </div>
            <h4 className="font-sans font-bold text-muted-foreground">No alerts at the moment</h4>
            <p className="text-sm font-serif italic text-muted-foreground/60 mt-1">Your warehouse operations are running smoothly</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Notifications;
