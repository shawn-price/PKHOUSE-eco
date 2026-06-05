'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Property {
  id: number;
  title: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  price: number;
  bedrooms?: number;
  bathrooms?: number;
  square_feet?: number;
  property_type: string;
  property_image_url?: string;
  agent_id?: number;
  created_at: string;
  updated_at: string;
}

export default function PropertyDetailPage() {
  const params = useParams();
  const { data: session } = useSession();
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProperty();
  }, [params.id]);

  const fetchProperty = async () => {
    try {
      const response = await fetch(`/api/properties/${params.id}`);
      const data = await response.json();
      
      if (data.success) {
        setProperty(data.data);
      } else {
        setError('Property not found');
      }
    } catch (err) {
      setError('Failed to load property');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">{error || 'Property not found'}</h1>
          <Link href="/properties">
            <Button>Back to Properties</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = session?.user && parseInt((session.user as any).id) === property.agent_id;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/properties" className="text-primary hover:underline">
            ← Back to Properties
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image */}
            {property.property_image_url && (
              <div className="w-full h-96 bg-slate-200 rounded-lg mb-8 flex items-center justify-center overflow-hidden">
                <img
                  src={property.property_image_url}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Details */}
            <h1 className="text-4xl font-bold text-foreground mb-4">{property.title}</h1>
            
            <div className="mb-6">
              <p className="text-xl text-muted-foreground mb-2">
                {property.address}, {property.city}, {property.state} {property.zip_code}
              </p>
              <span className="inline-block px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold capitalize">
                {property.property_type}
              </span>
            </div>

            {/* Price */}
            <div className="mb-8">
              <p className="text-sm text-muted-foreground mb-1">Price</p>
              <p className="text-4xl font-bold text-foreground">
                ${property.price.toLocaleString()}
              </p>
            </div>

            {/* Specs */}
            <div className="bg-card border border-border rounded-lg p-6 mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Property Details</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {property.bedrooms !== undefined && (
                  <div>
                    <p className="text-sm text-muted-foreground">Bedrooms</p>
                    <p className="text-2xl font-bold text-foreground">{property.bedrooms}</p>
                  </div>
                )}
                {property.bathrooms !== undefined && (
                  <div>
                    <p className="text-sm text-muted-foreground">Bathrooms</p>
                    <p className="text-2xl font-bold text-foreground">{property.bathrooms}</p>
                  </div>
                )}
                {property.square_feet !== undefined && (
                  <div>
                    <p className="text-sm text-muted-foreground">Square Feet</p>
                    <p className="text-2xl font-bold text-foreground">{property.square_feet.toLocaleString()}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="text-2xl font-bold text-foreground capitalize">{property.property_type}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            {property.description && (
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-2xl font-semibold text-foreground mb-4">Description</h2>
                <p className="text-foreground whitespace-pre-wrap">{property.description}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div>
            {/* CTA Buttons */}
            <div className="bg-card border border-border rounded-lg p-6 sticky top-8">
              {isOwner ? (
                <div className="space-y-3">
                  <Link href={`/dashboard/properties/${property.id}/edit`} className="block">
                    <Button className="w-full">Edit Property</Button>
                  </Link>
                  <Button variant="outline" className="w-full">Delete Property</Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Link href={`/dashboard/messages?property_id=${property.id}`} className="block">
                    <Button className="w-full">Contact Agent</Button>
                  </Link>
                  <Button variant="outline" className="w-full">Add to Favorites</Button>
                  <Button variant="outline" className="w-full">Make Offer</Button>
                </div>
              )}

              {/* Info Box */}
              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground mb-2">Listed on</p>
                <p className="text-sm text-foreground">
                  {new Date(property.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
