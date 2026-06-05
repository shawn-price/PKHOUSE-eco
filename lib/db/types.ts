export interface User {
  id: number;
  email: string;
  name: string;
  password_hash: string;
  role: 'consumer' | 'middleman' | 'agent';
  phone?: string;
  avatar_url?: string;
  bio?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Property {
  id: number;
  title: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  property_type: string;
  price: number;
  bedrooms?: number;
  bathrooms?: number;
  square_feet?: number;
  property_image_url?: string;
  agent_id?: number;
  created_at: Date;
  updated_at: Date;
}

export interface Deal {
  id: number;
  property_id: number;
  consumer_id: number;
  middleman_id?: number;
  agent_id?: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  deal_amount: number;
  created_at: Date;
  updated_at: Date;
}

export interface Commission {
  id: number;
  deal_id: number;
  user_id: number;
  commission_percentage: number;
  commission_amount: number;
  status: 'pending' | 'paid';
  paid_date?: Date;
  created_at: Date;
}

export interface Lead {
  id: number;
  name: string;
  email: string;
  phone?: string;
  source?: string;
  interested_property_type?: string;
  budget_min?: number;
  budget_max?: number;
  middleman_id?: number;
  agent_id?: number;
  status: 'new' | 'contacted' | 'qualified' | 'lost';
  created_at: Date;
  updated_at: Date;
}

export interface Network {
  id: number;
  agent_id: number;
  partner_agent_id: number;
  status: 'pending' | 'connected' | 'inactive';
  created_at: Date;
}

export interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  property_id?: number;
  is_read: boolean;
  read_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface MessageConversation {
  id: number;
  subject?: string;
  created_by: number;
  created_at: Date;
  updated_at: Date;
}

export interface MessageParticipant {
  id: number;
  conversation_id: number;
  user_id: number;
  joined_at: Date;
}

export interface ConversationMessage {
  id: number;
  conversation_id: number;
  sender_id: number;
  content: string;
  property_id?: number;
  created_at: Date;
  updated_at: Date;
}

export interface Embedding {
  id: number;
  entity_type: string;
  entity_id: number;
  embedding: number[];
  content_preview?: string;
  created_at: Date;
  updated_at: Date;
}

export interface AIAgent {
  id: number;
  name: string;
  agent_type: string;
  description?: string;
  system_prompt?: string;
  model_name?: string;
  temperature?: number;
  max_tokens?: number;
  enabled: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface AICrew {
  id: number;
  name: string;
  description?: string;
  agent_ids: number[];
  enabled: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface SystemConfig {
  id: number;
  config_key: string;
  config_value?: string;
  config_type?: string;
  updated_at: Date;
  updated_by?: number;
}

export interface LLMSettings {
  id: number;
  provider: string;
  api_key_encrypted: string;
  model_name?: string;
  temperature?: number;
  max_tokens?: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Contact {
  id: number;
  user_id: number;
  contact_email: string;
  contact_name: string;
  contact_phone?: string;
  contact_type: 'agent' | 'broker' | 'inspector' | 'lawyer' | 'developer' | 'other';
  company?: string;
  notes?: string;
  is_favorite: boolean;
  created_at: Date;
  updated_at: Date;
}
