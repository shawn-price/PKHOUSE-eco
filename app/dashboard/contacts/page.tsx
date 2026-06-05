'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface Contact {
  id: number;
  contact_name: string;
  contact_email: string;
  contact_phone?: string;
  contact_type: string;
  company?: string;
  is_favorite: boolean;
  created_at: string;
}

export default function ContactsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    if (status === 'authenticated') {
      fetchContacts();
    }
  }, [status, router, filterType]);

  const fetchContacts = async () => {
    try {
      const params = new URLSearchParams();
      if (filterType) params.append('type', filterType);

      const response = await fetch(`/api/contacts?${params.toString()}`);
      const data = await response.json();
      if (data.success) {
        setContacts(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const contactTypes = ['agent', 'broker', 'inspector', 'lawyer', 'developer', 'other'];

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Contacts</h1>
            <p className="text-muted-foreground mt-1">Manage your contact directory</p>
          </div>
          <Link href="/dashboard/contacts/new">
            <Button>Add Contact</Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setFilterType('')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterType === ''
                ? 'bg-primary text-primary-foreground'
                : 'bg-card border border-border text-foreground hover:bg-slate-50'
            }`}
          >
            All Contacts
          </button>
          {contactTypes.map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                filterType === type
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card border border-border text-foreground hover:bg-slate-50'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Contacts List */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading contacts...</p>
          </div>
        ) : contacts.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <h2 className="text-xl font-semibold text-foreground mb-2">No Contacts Yet</h2>
            <p className="text-muted-foreground mb-6">Start by adding your first contact</p>
            <Link href="/dashboard/contacts/new">
              <Button>Add Your First Contact</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contacts.map(contact => (
              <div
                key={contact.id}
                className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{contact.contact_name}</h3>
                    <p className="text-sm text-muted-foreground capitalize">{contact.contact_type}</p>
                  </div>
                  {contact.is_favorite && (
                    <span className="text-lg">★</span>
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-sm text-muted-foreground">
                    <strong>Email:</strong> {contact.contact_email}
                  </p>
                  {contact.contact_phone && (
                    <p className="text-sm text-muted-foreground">
                      <strong>Phone:</strong> {contact.contact_phone}
                    </p>
                  )}
                  {contact.company && (
                    <p className="text-sm text-muted-foreground">
                      <strong>Company:</strong> {contact.company}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Link href={`/dashboard/contacts/${contact.id}`} className="flex-1">
                    <Button variant="outline" className="w-full">View</Button>
                  </Link>
                  <Link href={`/dashboard/contacts/${contact.id}/edit`} className="flex-1">
                    <Button variant="outline" className="w-full">Edit</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
