'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface Property {
  id: number;
  title: string;
  address: string;
  city: string;
  price: number;
  property_type: string;
  created_at: string;
}

export default function AgentDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    if (status === 'authenticated' && (session?.user as any)?.role !== 'agent') {
      router.push('/dashboard');
      return;
    }

    fetchProperties();
  }, [status, session, router]);

  const fetchProperties = async () => {
    try {
      const response = await fetch('/api/my-properties');
      const data = await response.json();
      if (data.success) {
        setProperties(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch properties:', error);
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Properties</h1>
            <p className="text-muted-foreground mt-1">Manage your real estate listings</p>
          </div>
          <Link href="/dashboard/agent/new">
            <Button>Add New Property</Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading properties...</p>
          </div>
        ) : properties.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <h2 className="text-xl font-semibold text-foreground mb-2">No Properties Yet</h2>
            <p className="text-muted-foreground mb-6">Start by adding your first property listing</p>
            <Link href="/dashboard/agent/new">
              <Button>Create Your First Listing</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {properties.map(property => (
              <div
                key={property.id}
                className="bg-card border border-border rounded-lg p-6 flex items-center justify-between"
              >
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{property.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {property.address}, {property.city}
                  </p>
                  <p className="text-lg font-bold text-foreground mt-2">
                    ${property.price.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Listed on {new Date(property.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link href={`/properties/${property.id}`}>
                    <Button variant="outline" size="sm">View</Button>
                  </Link>
                  <Link href={`/dashboard/agent/properties/${property.id}/edit`}>
                    <Button variant="outline" size="sm">Edit</Button>
                  </Link>
                  <Button variant="outline" size="sm" className="text-destructive">Delete</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
