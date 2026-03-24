import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowRightLeft, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Settings2,
  Calendar,
  Search,
  CheckCircle2
} from 'lucide-react';
import { getMovements } from '../api/stockApi';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import MovementForm from '../components/inventory/MovementForm';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';

const StockMovements = () => {
  const [filterType, setFilterType] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { data: movements, isLoading } = useQuery({
    queryKey: ['movements', filterType],
    queryFn: () => getMovements({ type: filterType }),
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-sans text-foreground">Stock Movements</h1>
          <p className="text-muted-foreground font-serif italic text-sm mt-1">Audit trail of all inventory ins, outs, and adjustments</p>
        </div>
        <Button 
          className="flex items-center gap-2 font-bold h-11 px-6"
          onClick={() => setIsModalOpen(true)}
        >
          <ArrowRightLeft className="w-4 h-4" /> Record Movement
        </Button>
      </header>

      {/* Filter Tabs */}
      <div className="flex gap-2 p-1 bg-muted/30 rounded-[0.25rem] w-fit border border-border">
        {['', 'IN', 'OUT', 'ADJUSTMENT'].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-4 py-1.5 rounded-[0.2rem] text-xs font-bold font-sans transition-all ${
              filterType === type 
                ? 'bg-primary text-primary-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {type || 'ALL HISTORY'}
          </button>
        ))}
      </div>

      <section className="bg-card border border-border rounded-[0.25rem] shadow-sm overflow-hidden">
        <Table 
          headers={['Date & Time', 'Type', 'Product', 'SKU', 'Change', 'Previous', 'New Qty', 'Reason', 'By']}
          data={movements?.data?.data || []}
          renderRow={(item) => (
            <tr key={item.id} className="hover:bg-muted/30 transition-colors border-b border-border last:border-0 font-serif">
              <td className="px-4 py-4">
                <div className="flex items-center gap-2 text-xs">
                  <Calendar className="w-3 h-3 text-muted-foreground" />
                  <span className="font-mono">{new Date(item.created_at).toLocaleString()}</span>
                </div>
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-2">
                  {item.type === 'IN' && <ArrowUpCircle className="w-4 h-4 text-green-600" />}
                  {item.type === 'OUT' && <ArrowDownCircle className="w-4 h-4 text-red-600" />}
                  {item.type === 'ADJUSTMENT' && <Settings2 className="w-4 h-4 text-amber-600" />}
                  <span className={clsx(
                    "font-sans font-bold text-xs",
                    item.type === 'IN' && "text-green-700",
                    item.type === 'OUT' && "text-red-700",
                    item.type === 'ADJUSTMENT' && "text-amber-700"
                  )}>
                    {item.type}
                  </span>
                </div>
              </td>
              <td className="px-4 py-4 font-bold text-sm">{item.product_name}</td>
              <td className="px-4 py-4 font-mono text-xs">{item.product_sku}</td>
              <td className={clsx(
                "px-4 py-4 font-mono font-bold text-sm",
                item.type === 'IN' ? "text-green-600" : (item.type === 'OUT' ? "text-red-600" : "text-amber-600")
              )}>
                {item.type === 'IN' ? '+' : (item.type === 'OUT' ? '-' : '')}{item.quantity}
              </td>
              <td className="px-4 py-4 font-mono text-xs text-muted-foreground">{item.previous_qty}</td>
              <td className="px-4 py-4 font-mono font-bold text-sm">→ {item.new_qty}</td>
              <td className="px-4 py-4 text-xs italic text-muted-foreground max-w-[200px] truncate" title={item.reason}>
                {item.reason}
              </td>
              <td className="px-4 py-4 font-sans font-medium text-xs">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-primary/60" />
                  {item.user_name}
                </div>
              </td>
            </tr>
          )}
        />
      </section>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Stock Movement"
      >
        <MovementForm onClose={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
};

export default StockMovements;
