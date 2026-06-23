'use client';

import * as React from 'react';
import { Download, Trash2, Mail, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getNewsletterSubscribers, deleteNewsletterSubscriber, type NewsletterSubscriber } from '@/lib/admin-actions';

export default function NewsletterPage() {
  const [subscribers, setSubscribers] = React.useState<NewsletterSubscriber[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [toast, setToast] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    async function run() {
      const data = await getNewsletterSubscribers();
      if (!cancelled) {
        setSubscribers(data);
        setLoading(false);
      }
    }
    run();
    return () => { cancelled = true; };
  }, []);

  React.useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteNewsletterSubscriber(deleteId);
    setDeleteId(null);
    setToast('Subscriber removed');
    const data = await getNewsletterSubscribers();
    setSubscribers(data);
  };

  const handleExportCSV = () => {
    const header = 'Email,Subscribed On';
    const rows = subscribers.map(
      (s) => `${s.email},${new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setToast('CSV downloaded');
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 bg-emerald-600 text-white text-sm font-medium rounded-lg shadow-lg">
          <Check className="size-4" />
          {toast}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0A0A]">Newsletter Subscribers</h2>
          <p className="text-sm text-gray-500 mt-1">{subscribers.length} subscribers</p>
        </div>
        <button
          onClick={handleExportCSV}
          disabled={subscribers.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#C9A84C] text-white text-sm font-semibold rounded-lg hover:bg-[#C9A84C]/90 transition-colors disabled:opacity-50"
        >
          <Download className="size-4" />
          Export CSV
        </button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Subscribed On</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscribers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-12 text-gray-500">
                    No subscribers yet.
                  </TableCell>
                </TableRow>
              ) : (
                subscribers.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="size-4 text-gray-400" />
                        <span className="text-sm font-medium">{s.email}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {new Date(s.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <button
                        onClick={() => setDeleteId(s.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-[#0A0A0A] mb-2">Remove Subscriber</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure? This subscriber will be removed from the list.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
