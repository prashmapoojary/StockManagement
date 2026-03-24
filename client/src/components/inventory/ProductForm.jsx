import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createProduct, updateProduct } from '../../api/productApi';
import { getCategories } from '../../api/categoryApi';
import { getWarehouses } from '../../api/warehouseApi';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import toast from 'react-hot-toast';

const productSchema = z.object({
  sku: z.string().min(3, 'SKU must be at least 3 characters'),
  name: z.string().min(2, 'Name is required'),
  description: z.string().optional(),
  category_id: z.string().min(1, 'Category is required'),
  warehouse_id: z.string().min(1, 'Warehouse is required'),
  unit: z.string().min(1, 'Unit is required'),
  quantity: z.number().min(0).default(0),
  min_threshold: z.number().min(0).default(10),
  max_threshold: z.number().min(0).optional(),
  unit_price: z.number().min(0).default(0),
  location_code: z.string().optional(),
});

const ProductForm = ({ product, onClose }) => {
  const queryClient = useQueryClient();
  const isEditing = !!product;

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: product || {
      quantity: 0,
      min_threshold: 10,
      unit_price: 0,
    },
  });
  
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const { data: warehousesData, isLoading: warehousesLoading } = useQuery({
    queryKey: ['warehouses'],
    queryFn: getWarehouses,
  });

  const categories = categoriesData?.data?.data || [];
  const warehouses = warehousesData?.data?.data || [];

  const mutation = useMutation({
    mutationFn: (data) => isEditing ? updateProduct(product.id, data) : createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      toast.success(`Product ${isEditing ? 'updated' : 'created'} successfully`);
      onClose?.();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Something went wrong');
    }
  });

  return (
    <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-bold font-sans uppercase text-muted-foreground mr-2">SKU / Item Code</label>
          <Input {...register('sku')} error={errors.sku?.message} placeholder="e.g. WH-ELC-001" disabled={isEditing} />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold font-sans uppercase text-muted-foreground mr-2">Product Name</label>
          <Input {...register('name')} error={errors.name?.message} placeholder="e.g. Industrial Forklift Tire" />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-bold font-sans uppercase text-muted-foreground mr-2">Description</label>
        <textarea 
          {...register('description')}
          className="w-full bg-card border border-border p-3 text-sm rounded-[0.25rem] min-h-[80px] focus:outline-none focus:ring-2 focus:ring-ring font-serif"
          placeholder="Detailed description of the stock item..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-bold font-sans uppercase text-muted-foreground mr-2">Category</label>
          <Select 
            {...register('category_id')} 
            error={errors.category_id?.message}
            options={[
              { value: '', label: 'Select Category' },
              ...categories.map(c => ({ value: c.id, label: c.name }))
            ]}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold font-sans uppercase text-muted-foreground mr-2">Warehouse</label>
          <Select 
            {...register('warehouse_id')} 
            error={errors.warehouse_id?.message}
            options={[
              { value: '', label: 'Select Warehouse' },
              ...warehouses.map(w => ({ value: w.id, label: w.name }))
            ]}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-bold font-sans uppercase text-muted-foreground mr-2">Unit</label>
          <Input {...register('unit')} placeholder="pcs, kg, m" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold font-sans uppercase text-muted-foreground mr-2">Initial Qty</label>
          <Input type="number" {...register('quantity', { valueAsNumber: true })} disabled={isEditing} />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold font-sans uppercase text-muted-foreground mr-2">Min Alert</label>
          <Input type="number" {...register('min_threshold', { valueAsNumber: true })} />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold font-sans uppercase text-muted-foreground mr-2">Max Limit</label>
          <Input type="number" {...register('max_threshold', { valueAsNumber: true })} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-bold font-sans uppercase text-muted-foreground mr-2">Unit Price (₹)</label>
          <Input type="number" step="0.01" {...register('unit_price', { valueAsNumber: true })} />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold font-sans uppercase text-muted-foreground mr-2">Internal Location</label>
          <Input {...register('location_code')} placeholder="e.g. RACK-A4-B2" />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit" className="font-bold min-w-[120px]" disabled={mutation.isPending}>
          {mutation.isPending ? 'Saving...' : isEditing ? 'Update Item' : 'Create Item'}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;
