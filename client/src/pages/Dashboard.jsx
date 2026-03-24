import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Package, 
  AlertTriangle, 
  ArrowRightLeft, 
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react';
import StatCard from '../components/ui/StatCard';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import MovementForm from '../components/inventory/MovementForm';
import { useNavigate } from 'react-router-dom';
import { getStats, getLowStock } from '../api/dashboardApi';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const Dashboard = () => {
  const navigate = useNavigate();
  const [isRestockModalOpen, setIsRestockModalOpen] = React.useState(false);
  const [selectedProductId, setSelectedProductId] = React.useState(null);

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const res = await getStats();
      return res.data.data;
    }
  });

  const { data: lowStockData, isLoading: lowStockLoading } = useQuery({
    queryKey: ['low-stock'],
    queryFn: async () => {
      const res = await getLowStock();
      return res.data.data;
    }
  });

  // Mock trend data for visualization
  const trendData = [
    { name: 'Mon', in: 12, out: 18 },
    { name: 'Tue', in: 25, out: 14 },
    { name: 'Wed', in: 18, out: 22 },
    { name: 'Thu', in: 35, out: 30 },
    { name: 'Fri', in: 22, out: 28 },
    { name: 'Sat', in: 15, out: 10 },
    { name: 'Sun', in: 8, out: 5 },
  ];

  const pieData = [
    { name: 'Electronics', value: 400 },
    { name: 'Furniture', value: 300 },
    { name: 'Tools', value: 300 },
    { name: 'PPE', value: 200 },
  ];

  const COLORS = ['#92400e', '#b45309', '#d97706', '#f59e0b'];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-3xl font-bold font-sans text-foreground">Operations Dashboard</h1>
        <p className="text-muted-foreground font-serif italic text-sm mt-1">Real-time warehouse status and inventory metrics</p>
      </header>

      {/* Stat Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard 
          label="Total Products" 
          value={statsLoading ? '...' : statsData?.totalProducts || 0} 
          icon={Package} 
          trend="up" 
          trendValue="12%"
          colorClass="bg-primary"
        />
        <StatCard 
          label="Low Stock Items" 
          value={statsLoading ? '...' : statsData?.lowStockCount || 0} 
          icon={AlertTriangle} 
          colorClass="bg-amber-600"
        />
        <StatCard 
          label="Movements Today" 
          value={statsLoading ? '...' : statsData?.movementsToday || 0} 
          icon={ArrowRightLeft} 
          trend="down" 
          trendValue="5%"
          colorClass="bg-blue-600"
        />
        <StatCard 
          label="Total Stock Value" 
          value={statsLoading ? '...' : `₹${statsData?.totalStockValue?.toLocaleString() || 0}`} 
          icon={TrendingUp} 
          colorClass="bg-green-600"
        />
      </section>

      {/* Charts section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border p-6 rounded-[0.25rem] shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-sans font-bold flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              7-Day Stock Movements
            </h3>
            <div className="flex gap-4 text-[10px] font-mono uppercase tracking-wider">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-primary"></div> In</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-red-600"></div> Out</div>
            </div>
          </div>
          <div className="h-72 w-full font-mono text-[10px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} dy={10} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)', borderRadius: '0.25rem', fontFamily: 'var(--font-mono)', fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="in" stroke="#92400e" strokeWidth={3} dot={{ r: 4, fill: '#92400e' }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="out" stroke="#dc2626" strokeWidth={3} dot={{ r: 4, fill: '#dc2626' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border border-border p-6 rounded-[0.25rem] shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-sans font-bold flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-primary" />
              Stock by Category
            </h3>
          </div>
          <div className="h-72 w-full flex flex-col md:flex-row items-center justify-around">
            <div className="w-full h-full max-w-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)', borderRadius: '0.25rem', fontFamily: 'var(--font-mono)', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3 font-serif mt-4 md:mt-0">
              {pieData.map((item, index) => (
                <div key={item.name} className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                  <span className="text-muted-foreground">{item.name}</span>
                  <span className="font-bold font-mono ml-auto">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Low Stock Table */}
      <section className="bg-card border border-border rounded-[0.25rem] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between bg-muted/20">
          <h3 className="font-sans font-bold flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            Low Stock Alerts
          </h3>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-primary font-bold"
            onClick={() => navigate('/inventory')}
          >
            View All Inventory →
          </Button>
        </div>
        <Table 
          headers={['SKU', 'Product Name', 'Category', 'Quantity', 'Min Limit', 'Status', 'Actions']}
          data={lowStockData || []}
          renderRow={(item) => (
            <tr key={item.id} className="hover:bg-muted/30 transition-colors">
              <td className="px-4 py-3 font-mono font-medium">{item.sku}</td>
              <td className="px-4 py-3 font-bold">{item.name}</td>
              <td className="px-4 py-3 text-muted-foreground">{item.category_name}</td>
              <td className="px-4 py-3 font-mono font-bold text-destructive">{item.quantity}</td>
              <td className="px-4 py-3 font-mono text-muted-foreground">{item.min_threshold}</td>
              <td className="px-4 py-3">
                <Badge variant={item.quantity === 0 ? 'OUT' : 'LOW'}>
                  {item.quantity === 0 ? 'Out of Stock' : 'Low Stock'}
                </Badge>
              </td>
              <td className="px-4 py-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 shadow-sm"
                  onClick={() => {
                    setSelectedProductId(item.id);
                    setIsRestockModalOpen(true);
                  }}
                >
                  Restock
                </Button>
              </td>
            </tr>
          )}
        />
      </section>

      <Modal
        isOpen={isRestockModalOpen}
        onClose={() => setIsRestockModalOpen(false)}
        title="Record Stock Movement (Restock)"
      >
        <MovementForm 
          onClose={() => setIsRestockModalOpen(false)} 
          initialProductId={selectedProductId}
        />
      </Modal>
    </div>
  );
};

export default Dashboard;
