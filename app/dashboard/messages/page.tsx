'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  is_read: boolean;
  created_at: string;
}

interface Conversation {
  user_id: number;
  last_message_at: string;
}

export default function MessagesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(
    parseInt(searchParams.get('with') || '0') || null
  );
  const [messageText, setMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const userId = session?.user ? parseInt((session.user as any).id) : null;

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    if (status === 'authenticated' && userId) {
      fetchConversations();
    }
  }, [status, router, userId]);

  useEffect(() => {
    if (selectedUserId && userId) {
      fetchMessages(selectedUserId);
    }
  }, [selectedUserId, userId]);

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/messages');
      const data = await response.json();
      if (data.success) {
        setConversations(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (otherUserId: number) => {
    try {
      const response = await fetch(`/api/messages?with=${otherUserId}`);
      const data = await response.json();
      if (data.success) {
        setMessages(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedUserId) return;

    setIsSending(true);
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiver_id: selectedUserId,
          content: messageText,
        }),
      });

      if (response.ok) {
        setMessageText('');
        fetchMessages(selectedUserId);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Conversations List */}
      <div className="w-full md:w-80 bg-card border-r border-border flex flex-col">
        <div className="p-6 border-b border-border">
          <h1 className="text-xl font-bold text-foreground">Messages</h1>
        </div>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-4 text-center">
            <p className="text-muted-foreground">No conversations yet</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {conversations.map(conv => (
              <button
                key={conv.user_id}
                onClick={() => setSelectedUserId(conv.user_id)}
                className={`w-full p-4 border-b border-border text-left hover:bg-slate-50 transition-colors ${
                  selectedUserId === conv.user_id ? 'bg-slate-100' : ''
                }`}
              >
                <p className="font-medium text-foreground">User #{conv.user_id}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(conv.last_message_at).toLocaleDateString()}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Chat Area */}
      <div className="hidden md:flex flex-1 flex-col">
        {selectedUserId ? (
          <>
            {/* Header */}
            <div className="p-6 border-b border-border bg-card">
              <h2 className="text-lg font-semibold text-foreground">
                Conversation with User #{selectedUserId}
              </h2>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender_id === userId ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      msg.sender_id === userId
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-slate-100 text-foreground'
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(msg.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-6 border-t border-border bg-card">
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type a message..."
                  disabled={isSending}
                />
                <Button type="submit" disabled={isSending || !messageText.trim()}>
                  {isSending ? 'Sending...' : 'Send'}
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground">Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}
