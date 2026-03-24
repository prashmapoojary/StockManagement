import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, MoreVertical, Edit, Trash2, ArrowRightLeft } from 'lucide-react';
import axios from 'axios';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

import ProductForm from '../components/inventory/ProductForm';
import StockMovementForm from '../components/stock/StockMovementForm';
import Modal from '../components/ui/Modal';

const Inventory = () => {
  // --- STATE ---
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPrevPage: false,
    showing: { from: 0, to: 0, of: 0 }
  });
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // --- FETCH CATEGORIES ---
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await axios.get('/api/categories');
        setCategories(res.data.data || []);
      } catch (err) {
        console.error('Failed to load categories');
      }
    };
    loadCategories();
  }, []);

  // --- FETCH PRODUCTS ---
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit,
        search,
        category,
        status
      });
      
      // Remove empty params
      if (!search) params.delete('search');
      if (!category) params.delete('category');
      if (!status) params.delete('status');

      const res = await axios.get(`/api/products?${params.toString()}`);
      const body = res.data.data;

      setProducts(body.products || []);
      setPagination(body.pagination || {
        currentPage: 1, totalPages: 1, totalItems: 0, 
        showing: { from: 0, to: 0, of: 0 }
      });
    } catch (err) {
      console.error('Fetch products error:', err);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, category, status]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setPage(1);
  }, [search, category, status]);

  // --- HANDLERS ---
  const handleOpenAdd = () => {
    setSelectedProduct(null);
    setIsProductModalOpen(true);
  };

  const handleOpenEdit = (product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await axios.delete(`/api/products/${id}`);
      toast.success('Product deleted successfully');
      
      // If we deleted the last item on this page, go back one page
      if (products.length === 1 && page > 1) {
        setPage(prev => prev - 1);
      } else {
        fetchProducts();
      }
    } catch (err) {
      toast.error('Failed to delete product');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-sans text-foreground">Inventory Catalog</h1>
          <p className="text-muted-foreground font-serif italic text-sm mt-1">Manage and track all warehouse products</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="hidden sm:flex items-center gap-2" onClick={() => setIsMovementModalOpen(true)}>
            <ArrowRightLeft className="w-4 h-4" /> Record Movement
          </Button>
          <Button className="flex items-center gap-2 font-bold" onClick={handleOpenAdd}>
            <Plus className="w-4 h-4" /> Add Product
          </Button>
        </div>
      </header>

      {/* --- Filter Bar --- */}
      <div className="bg-card border border-border p-4 rounded-[0.25rem] flex flex-wrap gap-3 items-center shadow-sm">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or SKU..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded bg-card focus:outline-none focus:ring-2 focus:ring-ring font-sans"
          />
        </div>

        {/* Category filter */}
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="px-3 py-2 text-sm border border-border rounded bg-card focus:outline-none focus:ring-2 focus:ring-ring font-sans min-w-[140px]"
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        {/* Status filter */}
        <select
          value={status}
          onChange={e => setStatus(e.target.value)}
          className="px-3 py-2 text-sm border border-border rounded bg-card focus:outline-none focus:ring-2 focus:ring-ring font-sans min-w-[130px]"
        >
          <option value="">All Status</option>
          <option value="IN_STOCK">🟢 In Stock</option>
          <option value="LOW_STOCK">🟡 Low Stock</option>
          <option value="OUT_OF_STOCK">🔴 Out of Stock</option>
        </select>

        {/* Clear filters */}
        {(search || category || status) && (
          <button
            onClick={() => {
              setSearch('');
              setCategory('');
              setStatus('');
              setPage(1);
            }}
            className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground border border-border rounded hover:bg-accent transition-colors"
          >
            ✕ Clear
          </button>
        )}
      </div>

      {/* --- Products Table --- */}
      <section className="bg-card border border-border rounded-[0.25rem] shadow-sm overflow-hidden">
        <Table 
          headers={['SKU', 'Product Name', 'Category', 'Unit', 'Stock Level', 'Qty', 'Status', 'Actions']}
          data={products}
          renderRow={(item) => {
            const stockPercent = Math.min((item.quantity / (item.max_threshold || 100)) * 100, 100);
            let barColor = 'bg-primary';
            if (item.quantity <= item.min_threshold) barColor = 'bg-amber-600';
            if (item.quantity === 0) barColor = 'bg-destructive';

            return (
              <tr key={item.id} className="hover:bg-muted/30 transition-colors group">
                <td className="px-4 py-4 font-mono text-xs font-bold text-primary">{item.sku}</td>
                <td className="px-4 py-4">
                  <p className="font-bold text-sm leading-none">{item.name}</p>
                  <p className="text-[10px] text-muted-foreground mt-1 font-serif">{item.warehouse_name || 'Main Warehouse'}</p>
                </td>
                <td className="px-4 py-4 text-xs font-medium">{item.category_name}</td>
                <td className="px-4 py-4 text-xs font-serif italic text-muted-foreground">{item.unit}</td>
                <td className="px-4 py-4">
                  <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${barColor} transition-all duration-500`} 
                      style={{ width: `${stockPercent}%` }}
                    />
                  </div>
                </td>
                <td className="px-4 py-4 font-mono font-bold">{item.quantity}</td>
                <td className="px-4 py-4">
                  <Badge variant={item.quantity === 0 ? 'OUT' : (item.quantity <= item.min_threshold ? 'LOW' : 'OK')}>
                    {item.quantity === 0 ? 'Out' : (item.quantity <= item.min_threshold ? 'Low' : 'In Stock')}
                  </Badge>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit" onClick={() => handleOpenEdit(item)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(item.id)}
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="More">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          }}
        />
        
        {/* --- Pagination Bar --- */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/10">
          <span className="text-xs text-muted-foreground font-mono">
            Showing {pagination.showing.from} to {pagination.showing.to} of {pagination.showing.of} items
          </span>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>

            <button
              onClick={() => setPage(prev => Math.max(1, prev - 1))}
              disabled={!pagination.hasPrevPage || loading}
              className="px-3 py-1.5 text-xs border border-border rounded disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent hover:text-accent-foreground transition-colors font-sans"
            >
              Previous
            </button>

            {/* Page number pills */}
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter(p =>
                p === 1 ||
                p === pagination.totalPages ||
                Math.abs(p - pagination.currentPage) <= 1
              )
              .reduce((acc, p, idx, arr) => {
                if (idx > 0 && p - arr[idx - 1] > 1) {
                  acc.push('...');
                }
                acc.push(p);
                return acc;
              }, [])
              .map((p, idx) =>
                p === '...' ? (
                  <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground text-xs">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    disabled={loading}
                    className={`px-3 py-1.5 text-xs border rounded transition-colors ${
                      pagination.currentPage === p
                        ? 'bg-primary text-primary-foreground border-primary font-bold'
                        : 'border-border hover:bg-accent'
                    }`}
                  >
                    {p}
                  </button>
                )
              )
            }

            <button
              onClick={() => setPage(prev => Math.min(pagination.totalPages, prev + 1))}
              disabled={!pagination.hasNextPage || loading}
              className="px-3 py-1.5 text-xs border border-border rounded disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent hover:text-accent-foreground transition-colors font-sans"
            >
              Next
            </button>
          </div>
        </div>
      </section>

      {/* --- Modals --- */}
      <Modal 
        isOpen={isProductModalOpen} 
        onClose={() => setIsProductModalOpen(false)} 
        title={selectedProduct ? 'Update Inventory Item' : 'New Catalog Entry'}
      >
        <ProductForm 
          product={selectedProduct} 
          onSuccess={() => {
            setIsProductModalOpen(false);
            fetchProducts();
          }}
          onClose={() => setIsProductModalOpen(false)} 
        />
      </Modal>

      <Modal 
        isOpen={isMovementModalOpen} 
        onClose={() => setIsMovementModalOpen(false)} 
        title="Record Stock Movement"
      >
        <StockMovementForm 
          onSuccess={() => {
            setIsMovementModalOpen(false);
            fetchProducts();
          }}
          onClose={() => setIsMovementModalOpen(false)} 
        />
      </Modal>
    </div>
  );
};

export default Inventory;
