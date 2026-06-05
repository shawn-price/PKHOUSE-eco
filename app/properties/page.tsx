'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Property {
  id: number;
  title: string;
  address: string;
  city: string;
  state: string;
  price: number;
  bedrooms?: number;
  bathrooms?: number;
  square_feet?: number;
  property_type: string;
  property_image_url?: string;
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchCity, setSearchCity] = useState('');
  const [filterType, setFilterType] = useState('');

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async (city?: string, type?: string) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (city) params.append('city', city);
      if (type) params.append('type', type);
      
      const response = await fetch(`/api/properties?${params.toString()}`);
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProperties(searchCity, filterType);
  };

  const propertyTypes = ['residential', 'commercial', 'land', 'industrial', 'multi-family'];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-8">
          <h1 className="text-4xl font-bold mb-2">Browse Properties</h1>
          <p className="text-slate-300">Discover amazing properties in your area</p>
        </div>
      </div>

      {/* Search Section */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        <form onSubmit={handleSearch} className="bg-card border border-border rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                City
              </label>
              <Input
                type="text"
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                placeholder="New York, CA"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Property Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Types</option>
                {propertyTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2 flex items-end gap-2">
              <Button type="submit" className="flex-1">Search</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSearchCity('');
                  setFilterType('');
                  fetchProperties();
                }}
                className="flex-1"
              >
                Clear
              </Button>
            </div>
          </div>
        </form>

        {/* Results */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading properties...</p>
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No properties found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map(property => (
              <Link key={property.id} href={`/properties/${property.id}`}>
                <div className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                  {property.property_image_url && (
                    <div className="w-full h-48 bg-slate-200 flex items-center justify-center">
                      <img
                        src={property.property_image_url}
                        alt={property.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-foreground mb-1 line-clamp-2">
                      {property.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {property.address}, {property.city}
                    </p>
                    <p className="text-2xl font-bold text-foreground mb-3">
                      ${property.price.toLocaleString()}
                    </p>
                    <div className="flex gap-4 text-sm text-muted-foreground mb-4">
                      {property.bedrooms !== undefined && (
                        <span>{property.bedrooms} Beds</span>
                      )}
                      {property.bathrooms !== undefined && (
                        <span>{property.bathrooms} Baths</span>
                      )}
                      {property.square_feet !== undefined && (
                        <span>{property.square_feet.toLocaleString()} sqft</span>
                      )}
                    </div>
                    <span className="inline-block px-3 py-1 bg-slate-100 text-slate-700 rounded text-sm font-medium capitalize">
                      {property.property_type}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
