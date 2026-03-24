import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, 
  Minus, 
  ArrowRightLeft, 
  Check, 
  X,
  Search,
  ChevronRight,
  Package
} from 'lucide-react';
import { getProducts } from '../../api/productApi';
import { stockIn, stockOut, adjustStock } from '../../api/stockApi';
import Button from '../ui/Button';
import Input from '../ui/Input';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';

const StockMovementForm = ({ onClose }) => {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [movementType, setMovementType] = useState('IN');
  const [quantity, setQuantity] = useState(0);
  const [reason, setReason] = useState('');

  const { data: products } = useQuery({
    queryKey: ['products-search', search],
    queryFn: () => getProducts({ search, limit: 5 }),
    enabled: search.length > 1,
  });

  const mutation = useMutation({
    mutationFn: (data) => {
      if (movementType === 'IN') return stockIn(data);
      if (movementType === 'OUT') return stockOut(data);
      return adjustStock(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      queryClient.invalidateQueries(['movements']);
      queryClient.invalidateQueries(['dashboard-stats']);
      toast.success('Movement recorded successfully');
      onClose?.();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to record movement');
    }
  });

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleSubmit = () => {
    mutation.mutate({
      product_id: selectedProduct.id,
      quantity,
      new_quantity: quantity, // for adjustment
      reason,
    });
  };

  return (
    <div className="space-y-6">
      {/* Steps Indicator */}
      <div className="flex items-center justify-center gap-4 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div className={clsx(
              "w-8 h-8 rounded-full flex items-center justify-center font-bold font-sans transition-colors",
              step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            )}>
              {s}
            </div>
            {s < 3 && <div className={clsx("w-12 h-1 bg-muted mx-2", step > s && "bg-primary")} />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
          <h3 className="font-sans font-bold text-lg">Select Product</h3>
          <div className="relative">
            <Input 
              placeholder="Search product by name or SKU..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
            <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
          </div>
          
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {products?.data?.data?.map((p) => (
              <button
                key={p.id}
                onClick={() => { setSelectedProduct(p); handleNext(); }}
                className="w-full text-left p-3 rounded-[0.25rem] border border-border hover:bg-muted/50 transition-colors group flex items-center justify-between"
              >
                <div>
                  <p className="font-bold text-sm">{p.name}</p>
                  <p className="text-[10px] font-mono text-muted-foreground uppercase">{p.sku} • Current: {p.quantity} {p.unit}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </button>
            ))}
            {search.length > 1 && products?.data?.data?.length === 0 && (
              <p className="text-center py-4 text-sm text-muted-foreground italic font-serif">No products found</p>
            )}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
          <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-[0.25rem] border border-border">
            <div className="bg-primary/10 p-2 rounded-[0.25rem]">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold">{selectedProduct?.name}</p>
              <p className="text-[10px] font-mono text-muted-foreground">{selectedProduct?.sku}</p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-xs font-bold font-sans uppercase text-muted-foreground tracking-wider">Movement Type</label>
            <div className="flex gap-2 p-1 bg-muted/30 rounded-[0.25rem] border border-border">
              {['IN', 'OUT', 'ADJUSTMENT'].map((t) => (
                <button
                  key={t}
                  onClick={() => setMovementType(t)}
                  className={clsx(
                    "flex-1 py-2 rounded-[0.2rem] text-[10px] font-bold font-sans transition-all flex items-center justify-center gap-1",
                    movementType === t 
                      ? "bg-primary text-primary-foreground shadow-sm" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  {t === 'IN' && <Plus className="w-3 h-3" />}
                  {t === 'OUT' && <Minus className="w-3 h-3" />}
                  {t === 'ADJUSTMENT' && <ArrowRightLeft className="w-3 h-3" />}
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-xs font-bold font-sans uppercase text-muted-foreground tracking-wider">
              {movementType === 'ADJUSTMENT' ? 'New Quantity' : 'Change Amount'}
            </label>
            <Input 
              type="number" 
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="text-center text-xl font-mono font-bold h-12"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold font-sans uppercase text-muted-foreground tracking-wider">Reason / Reference</label>
            <textarea 
              className="w-full bg-card border border-border p-3 text-sm rounded-[0.25rem] min-h-[80px] focus:outline-none focus:ring-2 focus:ring-ring font-serif"
              placeholder="e.g. Monthly restock, Damage adjustment..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" className="flex-1" onClick={handleBack}>Back</Button>
            <Button className="flex-1 font-bold" onClick={handleNext}>Confirm Preview</Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
          <div className="text-center">
            <div className="inline-flex p-4 bg-green-100 rounded-full mb-4">
              <Check className="w-8 h-8 text-green-700" />
            </div>
            <h3 className="font-sans font-bold text-xl">Review Movement</h3>
          </div>

          <div className="space-y-4 bg-muted/20 p-5 rounded-[0.25rem] border border-border font-serif">
            <div className="flex justify-between border-b border-border/50 pb-2">
              <span className="text-muted-foreground italic">Product</span>
              <span className="font-bold font-sans">{selectedProduct?.name}</span>
            </div>
            <div className="flex justify-between border-b border-border/50 pb-2">
              <span className="text-muted-foreground italic">Type</span>
              <span className={clsx(
                "font-bold font-sans",
                movementType === 'IN' && "text-green-700",
                movementType === 'OUT' && "text-red-700"
              )}>{movementType}</span>
            </div>
            <div className="flex justify-between border-b border-border/50 pb-2">
              <span className="text-muted-foreground italic">Quantity Change</span>
              <span className="font-mono font-bold">{movementType === 'IN' ? '+' : (movementType === 'OUT' ? '-' : '')}{quantity}</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-muted-foreground italic">Resulting Stock</span>
              <span className="font-mono font-bold text-lg">
                {movementType === 'ADJUSTMENT' ? quantity : (movementType === 'IN' ? selectedProduct?.quantity + parseInt(quantity) : selectedProduct?.quantity - parseInt(quantity))}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={handleBack}>Back</Button>
            <Button className="flex-1 font-bold" onClick={handleSubmit} disabled={mutation.isPending}>
              {mutation.isPending ? 'Recording...' : 'Record Movement'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockMovementForm;
