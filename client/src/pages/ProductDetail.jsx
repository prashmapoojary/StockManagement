import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { 
  ChevronLeft, 
  IndianRupee, 
  Package, 
  MapPin, 
  Briefcase, 
  DollarSign, 
  ArrowDownRight,
  ArrowUpRight,
  TrendingDown,
  Clock
} from 'lucide-react';
import { getProductById } from '../api/productApi';
import { getProductMovements } from '../api/stockApi';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import MovementForm from '../components/inventory/MovementForm';
import { clsx } from 'clsx';

const ProductDetail = () => {
  const { id } = useParams();
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [movementType, setMovementType] = useState('IN');

  const { data: productRes, isLoading: productLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => getProductById(id),
  });

  const { data: movementsRes, isLoading: movementsLoading } = useQuery({
    queryKey: ['product-movements', id],
    queryFn: () => getProductMovements(id),
  });

  const product = productRes?.data?.data;
  const movements = movementsRes?.data?.data;

  if (productLoading) return <div className="p-8 text-center animate-pulse">Loading product details...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex items-center gap-4">
        <Link to="/inventory">
          <Button variant="ghost" size="icon" className="h-10 w-10">
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold font-sans text-foreground">{product?.name}</h1>
            <Badge variant={product?.quantity <= product?.min_threshold ? 'LOW' : 'OK'}>
              {product?.quantity <= product?.min_threshold ? 'Low Stock' : 'In Stock'}
            </Badge>
          </div>
          <p className="text-muted-foreground font-mono text-sm mt-1 uppercase tracking-widest">{product?.sku}</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Info Column */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-card border border-border p-6 rounded-[0.25rem] shadow-sm">
            <h3 className="font-sans font-bold text-lg mb-6 border-b border-border pb-2">Product Specifications</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 font-serif">
              <div className="flex justify-between items-center py-2 border-b border-dashed border-border/50">
                <span className="text-muted-foreground flex items-center gap-2"><Briefcase className="w-4 h-4" /> Category</span>
                <span className="font-bold">{product?.category_name}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-dashed border-border/50">
                <span className="text-muted-foreground flex items-center gap-2"><MapPin className="w-4 h-4" /> Location</span>
                <span className="font-bold font-mono text-sm">{product?.location_code || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-dashed border-border/50">
                <span className="text-muted-foreground flex items-center gap-2"><Package className="w-4 h-4" /> Unit Type</span>
                <span className="font-bold uppercase text-xs tracking-tighter">{product?.unit}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-dashed border-border/50">
                <span className="text-muted-foreground flex items-center gap-2"><IndianRupee className="w-4 h-4" /> Unit Price</span>
                <span className="font-bold font-mono">₹{product?.unit_price}</span>
              </div>
            </div>
            <div className="mt-8">
              <h4 className="text-xs font-bold font-sans uppercase text-muted-foreground tracking-widest mb-3">Description</h4>
              <p className="text-sm font-serif leading-relaxed text-foreground/80 bg-muted/10 p-4 rounded-[0.25rem] border border-border/30 italic">
                {product?.description || 'No description provided for this catalog item.'}
              </p>
            </div>
          </section>

          <section className="bg-muted/30 border border-border p-6 rounded-[0.25rem] font-serif">
            <h4 className="font-sans font-bold flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-primary" />
              Quick Info
            </h4>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center pb-2 border-b border-border/50">
                <span className="text-muted-foreground">Manufacturer</span>
                <span className="font-bold">Original Equipment</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-border/50">
                <span className="text-muted-foreground">Lead Time</span>
                <span className="font-bold">4-7 business days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Taxable Item</span>
                <span className="font-bold">Yes (GST 18%)</span>
              </div>
            </div>
          </section>

          <section className="bg-card border border-border rounded-[0.25rem] shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/20">
              <h3 className="font-sans font-bold flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Recent Activity Log
              </h3>
            </div>
            <Table 
              headers={['Date', 'Type', 'Qty', 'Balance', 'Performed By']}
              data={movements || []}
              renderRow={(m) => (
                <tr key={m.id} className="text-sm font-serif">
                  <td className="px-4 py-3 font-mono text-xs">{new Date(m.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <span className={clsx(
                      "font-bold text-[10px] px-2 py-0.5 rounded-full select-none",
                      m.type === 'IN' ? "bg-green-100 text-green-700" : (m.type === 'OUT' ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700")
                    )}>{m.type}</span>
                  </td>
                  <td className="px-4 py-3 font-mono">{m.type === 'OUT' ? '-' : '+'}{m.quantity}</td>
                  <td className="px-4 py-4 font-mono font-bold">{m.new_qty}</td>
                  <td className="px-4 py-3 text-xs">{m.user_name}</td>
                </tr>
              )}
            />
          </section>
        </div>

        {/* Action Column */}
        <div className="space-y-6">
          <section className="bg-card border border-border p-8 rounded-[0.25rem] shadow-lg text-center relative overflow-hidden">
             {/* Stock Gauge Style */}
             <div className="relative inline-flex items-center justify-center mb-6">
                <svg className="w-40 h-40 transform -rotate-90">
                  <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-muted/30" />
                  <circle 
                    cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="transparent" 
                    strokeDasharray={440}
                    strokeDashoffset={440 - (440 * (product?.quantity / (product?.max_threshold || 100)))}
                    className={clsx(
                      "transition-all duration-1000",
                      product?.quantity <= product?.min_threshold ? "text-amber-600" : "text-primary"
                    )}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold font-mono">{product?.quantity}</span>
                  <span className="text-[10px] font-sans uppercase text-muted-foreground tracking-widest">{product?.unit} available</span>
                </div>
             </div>

             <div className="space-y-2 mb-8 font-serif italic text-sm text-muted-foreground">
               <p>Threshold: {product?.min_threshold} min / {product?.max_threshold || '∞'} max</p>
               <p>Warehouse: {product?.warehouse_name}</p>
             </div>

              <div className="grid grid-cols-1 gap-3">
                <Button 
                  className="font-bold flex items-center justify-center gap-2 h-12"
                  onClick={() => { setMovementType('IN'); setIsMovementModalOpen(true); }}
                >
                  <ArrowUpRight className="w-5 h-5" /> Stock In
                </Button>
                <Button 
                  variant="outline" 
                  className="font-bold flex items-center justify-center gap-2 h-12"
                  onClick={() => { setMovementType('OUT'); setIsMovementModalOpen(true); }}
                >
                  <ArrowDownRight className="w-5 h-5" /> Stock Out
                </Button>
                <Button 
                  variant="secondary" 
                  className="font-bold flex items-center justify-center gap-2 h-12 text-destructive"
                  onClick={() => { setMovementType('ADJUSTMENT'); setIsMovementModalOpen(true); }}
                >
                  <TrendingDown className="w-5 h-5" /> Manual Adjustment
                </Button>
              </div>
          </section>

          <section className="bg-muted/30 border border-border p-6 rounded-[0.25rem] font-serif">
            <h4 className="text-xs font-bold font-sans uppercase text-muted-foreground tracking-widest mb-4">Meta Information</h4>
            <div className="space-y-3 text-xs italic">
              <p>Entry Created: {new Date(product?.created_at).toLocaleString()}</p>
              <p>Last Activity: {new Date(product?.updated_at).toLocaleString()}</p>
              <p>Authorized by: {product?.created_by_name || 'System Admin'}</p>
            </div>
          </section>
        </div>
      </div>

      <Modal
        isOpen={isMovementModalOpen}
        onClose={() => setIsMovementModalOpen(false)}
        title="Record Stock Movement"
      >
        <MovementForm 
          onClose={() => setIsMovementModalOpen(false)} 
          initialProductId={id}
          initialType={movementType}
        />
      </Modal>
    </div>
  );
};

export default ProductDetail;
