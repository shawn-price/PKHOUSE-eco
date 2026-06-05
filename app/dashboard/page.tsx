'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const userRole = (session?.user as any)?.role;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground">Welcome, {session?.user?.name}</h1>
          <p className="text-muted-foreground mt-2">
            Role: <span className="font-semibold capitalize">{userRole}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Profile</h2>
            <p className="text-muted-foreground mb-4">Manage your account information</p>
            <Link href="/dashboard/profile">
              <Button variant="outline" className="w-full">View Profile</Button>
            </Link>
          </div>

          {/* Properties Card */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Properties</h2>
            <p className="text-muted-foreground mb-4">Browse and manage real estate properties</p>
            <Link href="/properties">
              <Button variant="outline" className="w-full">Browse Properties</Button>
            </Link>
          </div>

          {/* Contacts Card */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Contacts</h2>
            <p className="text-muted-foreground mb-4">Manage your contact directory</p>
            <Link href="/dashboard/contacts">
              <Button variant="outline" className="w-full">View Contacts</Button>
            </Link>
          </div>

          {/* Messages Card */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Messages</h2>
            <p className="text-muted-foreground mb-4">Send and receive messages</p>
            <Link href="/dashboard/messages">
              <Button variant="outline" className="w-full">View Messages</Button>
            </Link>
          </div>

          {/* Deals Card (for Consumer/Agent) */}
          {(userRole === 'consumer' || userRole === 'agent') && (
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Deals</h2>
              <p className="text-muted-foreground mb-4">Track your ongoing deals</p>
              <Link href="/dashboard/deals">
                <Button variant="outline" className="w-full">View Deals</Button>
              </Link>
            </div>
          )}

          {/* Admin Panel (for Agents) */}
          {userRole === 'agent' && (
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Agent Tools</h2>
              <p className="text-muted-foreground mb-4">Manage your properties and listings</p>
              <Link href="/dashboard/agent">
                <Button variant="outline" className="w-full">Agent Dashboard</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-muted-foreground text-sm">Active Properties</p>
            <p className="text-3xl font-bold text-foreground mt-2">0</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-muted-foreground text-sm">Messages</p>
            <p className="text-3xl font-bold text-foreground mt-2">0</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-muted-foreground text-sm">Contacts</p>
            <p className="text-3xl font-bold text-foreground mt-2">0</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-muted-foreground text-sm">Total Deals</p>
            <p className="text-3xl font-bold text-foreground mt-2">0</p>
          </div>
        </div>
      </div>
    </div>
  );
}
