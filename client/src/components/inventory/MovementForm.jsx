import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { stockIn, stockOut, adjustStock } from '../../api/stockApi';
import { getProducts } from '../../api/productApi';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import toast from 'react-hot-toast';

const movementSchema = z.object({
  product_id: z.string().min(1, 'Product is required'),
  type: z.enum(['IN', 'OUT', 'ADJUSTMENT']),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  reason: z.string().min(3, 'Reason is required'),
});

const MovementForm = ({ onClose, initialProductId }) => {
  const queryClient = useQueryClient();

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(movementSchema),
    defaultValues: {
      product_id: initialProductId || '',
      type: 'IN',
      quantity: 1,
    },
  });

  const selectedType = watch('type');

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['products-list'],
    queryFn: () => getProducts({ limit: 100 }),
  });

  const products = productsData?.data?.data || [];

  const mutation = useMutation({
    mutationFn: (data) => {
      if (data.type === 'IN') return stockIn(data);
      if (data.type === 'OUT') return stockOut(data);
      return adjustStock({ product_id: data.product_id, new_quantity: data.quantity, reason: data.reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['movements']);
      queryClient.invalidateQueries(['products']);
      queryClient.invalidateQueries(['dashboard-stats']);
      toast.success('Movement recorded successfully');
      onClose?.();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to record movement');
    }
  });

  return (
    <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
      <div className="space-y-1">
        <label className="text-xs font-bold font-sans uppercase text-muted-foreground mr-2">Movement Type</label>
        <div className="flex gap-2 p-1 bg-muted/30 rounded-[0.25rem] border border-border">
          {['IN', 'OUT', 'ADJUSTMENT'].map((type) => (
            <label 
              key={type}
              className={`flex-1 text-center py-2 rounded-[0.2rem] text-xs font-bold font-sans cursor-pointer transition-all ${
                selectedType === type 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : 'text-muted-foreground hover:bg-muted/50'
              }`}
            >
              <input type="radio" value={type} {...register('type')} className="hidden" />
              {type}
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-bold font-sans uppercase text-muted-foreground mr-2">Select Product</label>
        <Select 
          {...register('product_id')} 
          error={errors.product_id?.message}
          options={[
            { value: '', label: 'Choose a product...' },
            ...products.map(p => ({ value: p.id, label: `${p.name} (${p.sku})` }))
          ]}
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-bold font-sans uppercase text-muted-foreground mr-2">
          {selectedType === 'ADJUSTMENT' ? 'New Total Quantity' : 'Quantity'}
        </label>
        <Input 
          type="number" 
          {...register('quantity', { valueAsNumber: true })} 
          error={errors.quantity?.message}
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-bold font-sans uppercase text-muted-foreground mr-2">Reason / Note</label>
        <textarea 
          {...register('reason')}
          className="w-full bg-card border border-border p-3 text-sm rounded-[0.25rem] min-h-[80px] focus:outline-none focus:ring-2 focus:ring-ring font-serif"
          placeholder="Why is this movement happening?"
        />
        {errors.reason && <p className="text-[10px] text-destructive font-sans font-bold uppercase">{errors.reason.message}</p>}
      </div>

      <div className="flex justify-end gap-3 pt-6">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit" className="font-bold min-w-[120px]" disabled={mutation.isPending}>
          {mutation.isPending ? 'Recording...' : 'Record Movement'}
        </Button>
      </div>
    </form>
  );
};

export default MovementForm;
