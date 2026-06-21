'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  DollarSign, ShoppingCart, Users, Package, TrendingUp, AlertTriangle,
  ArrowUpRight, ArrowDownRight, Clock, Truck, CheckCircle, XCircle,
  Plus, Eye, RotateCcw, Activity, ShoppingBag, Star, UserPlus, Zap,
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  getDashboardStats, getRecentOrders, getLowStockProducts, getSalesData,
  getOrderStatusBreakdown, getTopCustomers, getCategorySales, getActivityFeed,
  type DashboardStats, type RecentOrder, type LowStockProduct, type SalesData,
  type OrderStatusBreakdown, type TopCustomer, type CategorySales, type ActivityItem,
} from '@/lib/admin-actions';

const PIE_COLORS = ['#C9A84C', '#111111', '#6B7280', '#3B82F6', '#10B981', '#F59E0B'];

function StatCard({ title, value, icon: Icon, change, changeLabel, href }: {
  title: string; value: string; icon: React.ComponentType<{ className?: string }>;
  change?: number; changeLabel?: string; href?: string;
}) {
  const isPositive = change && change > 0;
  const content = (
    <CardContent className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-[#0A0A0A] mt-1">{value}</p>
          {change !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              {isPositive ? <ArrowUpRight className="size-3.5 text-emerald-500" /> : <ArrowDownRight className="size-3.5 text-red-500" />}
              <span className={`text-xs font-medium ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>{Math.abs(change)}%</span>
              <span className="text-xs text-gray-400">{changeLabel || 'vs last month'}</span>
            </div>
          )}
        </div>
        <div className="p-3 rounded-lg bg-[#C9A84C]/10"><Icon className="size-5 text-[#C9A84C]" /></div>
      </div>
    </CardContent>
  );
  return href ? <Link href={href}><Card className="hover:shadow-md transition-shadow cursor-pointer">{content}</Card></Link> : <Card>{content}</Card>;
}

function StatusBadge({ status }: { status: string }) {
  const v: Record<string, string> = {
    Delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Shipped: 'bg-blue-50 text-blue-700 border-blue-200',
    Processing: 'bg-amber-50 text-amber-700 border-amber-200',
    Pending: 'bg-gray-50 text-gray-700 border-gray-200',
    Cancelled: 'bg-red-50 text-red-700 border-red-200',
  };
  return <Badge variant="outline" className={v[status] || v.Pending}>{status}</Badge>;
}

const activityIcons: Record<string, React.ReactNode> = {
  order: <ShoppingBag className="size-4 text-[#C9A84C]" />,
  customer: <UserPlus className="size-4 text-blue-500" />,
  stock: <AlertTriangle className="size-4 text-amber-500" />,
  review: <Star className="size-4 text-emerald-500" />,
};

export default function AdminDashboard() {
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [orders, setOrders] = React.useState<RecentOrder[]>([]);
  const [lowStock, setLowStock] = React.useState<LowStockProduct[]>([]);
  const [sales, setSales] = React.useState<SalesData[]>([]);
  const [statusBreakdown, setStatusBreakdown] = React.useState<OrderStatusBreakdown[]>([]);
  const [topCustomers, setTopCustomers] = React.useState<TopCustomer[]>([]);
  const [categorySales, setCategorySales] = React.useState<CategorySales[]>([]);
  const [activity, setActivity] = React.useState<ActivityItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    Promise.all([
      getDashboardStats(), getRecentOrders(), getLowStockProducts(), getSalesData(),
      getOrderStatusBreakdown(), getTopCustomers(), getCategorySales(), getActivityFeed(),
    ]).then(([s, o, ls, sd, sb, tc, cs, af]) => {
      setStats(s); setOrders(o); setLowStock(ls); setSales(sd);
      setStatusBreakdown(sb); setTopCustomers(tc); setCategorySales(cs); setActivity(af);
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="size-8 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const revenueChange = stats && stats.lastMonthRevenue > 0
    ? Math.round(((stats.thisMonthRevenue - stats.lastMonthRevenue) / stats.lastMonthRevenue) * 100)
    : 0;

  return (
    <div className="space-y-8">
      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value={`Rs. ${(stats?.totalRevenue || 0).toLocaleString()}`} icon={DollarSign} change={revenueChange} changeLabel="vs last month" />
        <StatCard title="Total Orders" value={(stats?.totalOrders || 0).toLocaleString()} icon={ShoppingCart} change={8} changeLabel="vs last month" href="/admin/orders" />
        <StatCard title="Pending Orders" value={(stats?.pendingOrders || 0).toLocaleString()} icon={Clock} href="/admin/orders" />
        <StatCard title="Avg Order Value" value={`Rs. ${(stats?.avgOrderValue || 0).toLocaleString()}`} icon={TrendingUp} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Customers" value={(stats?.totalCustomers || 0).toLocaleString()} icon={Users} href="/admin/customers" />
        <StatCard title="Total Products" value={(stats?.totalProducts || 0).toLocaleString()} icon={Package} href="/admin/products" />
        <StatCard title="Low Stock Items" value={lowStock.length.toString()} icon={AlertTriangle} href="/admin/inventory" />
        <StatCard title="This Month Revenue" value={`Rs. ${(stats?.thisMonthRevenue || 0).toLocaleString()}`} icon={DollarSign} change={revenueChange} />
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Chart */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><TrendingUp className="size-4 text-[#C9A84C]" />Revenue Over Time</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[280px] min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <BarChart data={sales}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
                    <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={(v) => `Rs. ${(v / 1000).toFixed(0)}k`} />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '12px' }} formatter={(value) => [`Rs. ${Number(value).toLocaleString()}`, 'Revenue']} />
                    <Bar dataKey="revenue" fill="#C9A84C" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Status Breakdown */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><ShoppingCart className="size-4 text-[#C9A84C]" />Order Status</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[200px] min-h-[150px]">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <PieChart>
                  <Pie data={statusBreakdown} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={70} innerRadius={40} paddingAngle={3}>
                    {statusBreakdown.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {statusBreakdown.map((s, i) => (
                <div key={s.status} className="flex items-center gap-2 text-xs">
                  <div className="size-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="text-gray-600">{s.status}</span>
                  <span className="font-semibold ml-auto">{s.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Sales by Category + Top Customers + Activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Sales by Category */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Package className="size-4 text-[#C9A84C]" />Sales by Category</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[200px] min-h-[150px]">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <PieChart>
                  <Pie data={categorySales} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={40} paddingAngle={3}>
                    {categorySales.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-2">
              {categorySales.map((c, i) => (
                <div key={c.name} className="flex items-center gap-2 text-xs">
                  <div className="size-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="text-gray-600">{c.name}</span>
                  <span className="font-semibold ml-auto">{c.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Customers */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base"><Users className="size-4 text-[#C9A84C]" />Top Customers</CardTitle>
            <Link href="/admin/customers" className="text-sm text-[#C9A84C] hover:text-[#C9A84C]/80 font-medium">View all</Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCustomers.map((c, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-full bg-[#C9A84C]/10 flex items-center justify-center text-xs font-bold text-[#C9A84C]">
                      {c.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#0A0A0A]">{c.name}</p>
                      <p className="text-xs text-gray-400">{c.orders} orders</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-[#0A0A0A]">Rs. {c.totalSpent.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Activity className="size-4 text-[#C9A84C]" />Recent Activity</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activity.map((a) => (
                <div key={a.id} className="flex items-start gap-3">
                  <div className="p-1.5 rounded-full bg-gray-50">{activityIcons[a.type]}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#0A0A0A] line-clamp-2">{a.message}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Low Stock + Recent Orders ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Low Stock */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base"><AlertTriangle className="size-4 text-amber-500" />Low Stock Alerts</CardTitle>
            <Link href="/admin/inventory" className="text-sm text-[#C9A84C] hover:text-[#C9A84C]/80 font-medium">Manage</Link>
          </CardHeader>
          <CardContent>
            {lowStock.length === 0 ? (
              <p className="text-sm text-gray-400 py-4">All products are well-stocked.</p>
            ) : (
              <div className="space-y-4">
                {lowStock.map((p) => (
                  <div key={p.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`size-10 rounded-md flex items-center justify-center text-xs font-medium ${p.stock === 0 ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>{p.stock}</div>
                      <div>
                        <p className="text-sm font-medium text-[#0A0A0A] line-clamp-1">{p.name}</p>
                        <p className="text-xs text-gray-400">{p.stock === 0 ? 'Out of stock' : `${p.stock} left`}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className={p.stock === 0 ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'}>{p.stock === 0 ? 'Out' : 'Low'}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Recent Orders</CardTitle>
              <Link href="/admin/orders" className="text-sm text-[#C9A84C] hover:text-[#C9A84C]/80 font-medium">View all</Link>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell className="font-medium">#{o.id}</TableCell>
                      <TableCell>{o.customer}</TableCell>
                      <TableCell className="text-right">Rs. {o.total.toLocaleString()}</TableCell>
                      <TableCell><StatusBadge status={o.status} /></TableCell>
                      <TableCell className="text-right text-gray-400">{o.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Zap className="size-4 text-[#C9A84C]" />Quick Actions</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link href="/admin/products" className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-[#C9A84C] hover:bg-[#C9A84C]/5 transition-all group">
              <div className="p-2 rounded-lg bg-[#C9A84C]/10 group-hover:bg-[#C9A84C]/20 transition-colors"><Plus className="size-5 text-[#C9A84C]" /></div>
              <div>
                <p className="text-sm font-semibold text-[#0A0A0A]">Add New Product</p>
                <p className="text-xs text-gray-400">Create a new listing</p>
              </div>
            </Link>
            <Link href="/admin/orders" className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-[#C9A84C] hover:bg-[#C9A84C]/5 transition-all group">
              <div className="p-2 rounded-lg bg-amber-50 group-hover:bg-amber-100 transition-colors"><Eye className="size-5 text-amber-600" /></div>
              <div>
                <p className="text-sm font-semibold text-[#0A0A0A]">View Pending Orders</p>
                <p className="text-xs text-gray-400">{stats?.pendingOrders || 0} awaiting processing</p>
              </div>
            </Link>
            <Link href="/admin/orders" className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-[#C9A84C] hover:bg-[#C9A84C]/5 transition-all group">
              <div className="p-2 rounded-lg bg-red-50 group-hover:bg-red-100 transition-colors"><RotateCcw className="size-5 text-red-500" /></div>
              <div>
                <p className="text-sm font-semibold text-[#0A0A0A]">Process Refunds</p>
                <p className="text-xs text-gray-400">Manage return requests</p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
