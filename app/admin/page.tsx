'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface SystemStats {
  totalUsers: number;
  totalProperties: number;
  totalDeals: number;
  totalMessages: number;
  totalContacts: number;
}

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    // Check if user is admin (in a real app, check role)
    // For now, we'll allow anyone to see this page
    fetchStats();
  }, [status, router]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">System overview and management</p>
        </div>

        {/* Stats Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading statistics...</p>
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-card border border-border rounded-lg p-6">
              <p className="text-muted-foreground text-sm">Total Users</p>
              <p className="text-3xl font-bold text-foreground mt-2">{stats.totalUsers}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <p className="text-muted-foreground text-sm">Total Properties</p>
              <p className="text-3xl font-bold text-foreground mt-2">{stats.totalProperties}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <p className="text-muted-foreground text-sm">Total Deals</p>
              <p className="text-3xl font-bold text-foreground mt-2">{stats.totalDeals}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <p className="text-muted-foreground text-sm">Total Messages</p>
              <p className="text-3xl font-bold text-foreground mt-2">{stats.totalMessages}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <p className="text-muted-foreground text-sm">Total Contacts</p>
              <p className="text-3xl font-bold text-foreground mt-2">{stats.totalContacts}</p>
            </div>
          </div>
        ) : null}

        {/* Admin Tools */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">User Management</h2>
            <p className="text-muted-foreground mb-6">View and manage user accounts and roles</p>
            <Button variant="outline" className="w-full">Manage Users</Button>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Property Moderation</h2>
            <p className="text-muted-foreground mb-6">Review and moderate property listings</p>
            <Button variant="outline" className="w-full">Review Properties</Button>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">AI System Settings</h2>
            <p className="text-muted-foreground mb-6">Configure AI agents and LLM models</p>
            <Button variant="outline" className="w-full">AI Settings</Button>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Deal Management</h2>
            <p className="text-muted-foreground mb-6">Track and manage all platform deals</p>
            <Button variant="outline" className="w-full">View Deals</Button>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">System Configuration</h2>
            <p className="text-muted-foreground mb-6">Manage system settings and configurations</p>
            <Button variant="outline" className="w-full">System Settings</Button>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Reports & Analytics</h2>
            <p className="text-muted-foreground mb-6">View platform statistics and reports</p>
            <Button variant="outline" className="w-full">View Reports</Button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <p className="text-muted-foreground text-center py-8">No recent activity to display</p>
          </div>
        </div>
      </div>
    </div>
  );
}
