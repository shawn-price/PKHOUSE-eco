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
