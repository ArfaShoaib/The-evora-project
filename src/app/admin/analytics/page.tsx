'use client';

import * as React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, ShoppingBag } from 'lucide-react';
import { getAnalyticsRevenue, getAnalyticsOrdersByWeek, getAnalyticsTopProducts, type AnalyticsRevenue, type AnalyticsOrders, type TopProductSales } from '@/lib/admin-actions';

export default function AnalyticsPage() {
  const [loading, setLoading] = React.useState(true);
  const [revenueData, setRevenueData] = React.useState<AnalyticsRevenue[]>([]);
  const [ordersData, setOrdersData] = React.useState<AnalyticsOrders[]>([]);
  const [topProducts, setTopProducts] = React.useState<TopProductSales[]>([]);

  React.useEffect(() => {
    async function fetchAnalytics() {
      const [revenue, orders, top] = await Promise.all([
        getAnalyticsRevenue(),
        getAnalyticsOrdersByWeek(),
        getAnalyticsTopProducts(),
      ]);
      setRevenueData(revenue);
      setOrdersData(orders);
      setTopProducts(top);
      setLoading(false);
    }
    fetchAnalytics();
  }, []);

  if (loading) return <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-64 bg-gray-100 rounded-xl animate-pulse" />)}</div>;

  const maxSales = Math.max(...topProducts.map((p) => p.sales), 1);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0A0A0A]">Analytics</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><TrendingUp className="size-4 text-[#C9A84C]" />Revenue (12 months)</CardTitle></CardHeader><CardContent><div className="h-[300px] min-h-[200px]"><ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}><LineChart data={revenueData}><CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" /><XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} /><YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={(v) => `Rs. ${(v / 1000).toFixed(0)}k`} /><Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '12px' }} formatter={(value) => [`Rs. ${Number(value).toLocaleString()}`, 'Revenue']} /><Line type="monotone" dataKey="revenue" stroke="#C9A84C" strokeWidth={2} dot={{ fill: '#C9A84C', r: 4 }} /></LineChart></ResponsiveContainer></div></CardContent></Card>
        <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><ShoppingBag className="size-4 text-[#C9A84C]" />Orders (8 weeks)</CardTitle></CardHeader><CardContent><div className="h-[300px] min-h-[200px]"><ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}><BarChart data={ordersData}><CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" /><XAxis dataKey="week" stroke="#9CA3AF" fontSize={12} /><YAxis stroke="#9CA3AF" fontSize={12} /><Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '12px' }} /><Bar dataKey="orders" fill="#C9A84C" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div></CardContent></Card>
      </div>
      <Card><CardHeader><CardTitle className="text-base">Top 5 Products by Sales</CardTitle></CardHeader><CardContent><div className="space-y-4">{topProducts.length === 0 ? <p className="text-sm text-gray-400">No product sales data yet.</p> : topProducts.map((p, i) => <div key={i} className="flex items-center gap-4"><span className="text-sm font-medium text-gray-400 w-6">{i + 1}.</span><div className="flex-1"><p className="text-sm font-medium">{p.name}</p><div className="mt-1.5 h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-[#C9A84C] rounded-full" style={{ width: `${(p.sales / maxSales) * 100}%` }} /></div></div><span className="text-sm font-semibold text-[#0A0A0A]">{p.sales}</span></div>)}</div></CardContent></Card>
    </div>
  );
}
