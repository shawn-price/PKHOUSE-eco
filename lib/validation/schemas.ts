import { z } from 'zod';

// User schemas
export const UserRoleSchema = z.enum(['consumer', 'middleman', 'agent']);

export const UserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string().min(1),
  password_hash: z.string(),
  role: UserRoleSchema,
  phone: z.string().optional(),
  avatar_url: z.string().url().optional(),
  bio: z.string().optional(),
  created_at: z.date(),
  updated_at: z.date(),
});

export const UserRegistrationSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: UserRoleSchema,
});

export const UserUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  avatar_url: z.string().url().optional(),
  bio: z.string().optional(),
});

// Message schemas
export const MessageSchema = z.object({
  id: z.number(),
  sender_id: z.number(),
  receiver_id: z.number(),
  content: z.string().min(1),
  property_id: z.number().optional(),
  is_read: z.boolean(),
  read_at: z.date().optional(),
  created_at: z.date(),
  updated_at: z.date(),
});

export const MessageCreateSchema = z.object({
  receiver_id: z.number(),
  content: z.string().min(1, 'Message cannot be empty'),
  property_id: z.number().optional(),
});

// Message Conversation schemas
export const MessageConversationSchema = z.object({
  id: z.number(),
  subject: z.string().optional(),
  created_by: z.number(),
  created_at: z.date(),
  updated_at: z.date(),
});

export const MessageConversationCreateSchema = z.object({
  subject: z.string().optional(),
  participant_ids: z.array(z.number()).min(1),
});

// Contact schemas
export const ContactTypeSchema = z.enum(['agent', 'broker', 'inspector', 'lawyer', 'developer', 'other']);

export const ContactSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  contact_email: z.string().email(),
  contact_name: z.string().min(1),
  contact_phone: z.string().optional(),
  contact_type: ContactTypeSchema,
  company: z.string().optional(),
  notes: z.string().optional(),
  is_favorite: z.boolean(),
  created_at: z.date(),
  updated_at: z.date(),
});

export const ContactCreateSchema = z.object({
  contact_email: z.string().email('Invalid email address'),
  contact_name: z.string().min(1, 'Name is required'),
  contact_phone: z.string().optional(),
  contact_type: ContactTypeSchema,
  company: z.string().optional(),
  notes: z.string().optional(),
});

export const ContactUpdateSchema = z.object({
  contact_name: z.string().min(1).optional(),
  contact_phone: z.string().optional(),
  contact_type: ContactTypeSchema.optional(),
  company: z.string().optional(),
  notes: z.string().optional(),
  is_favorite: z.boolean().optional(),
});

// AI Agent schemas
export const AIAgentSchema = z.object({
  id: z.number(),
  name: z.string(),
  agent_type: z.string(),
  description: z.string().optional(),
  system_prompt: z.string().optional(),
  model_name: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  max_tokens: z.number().optional(),
  enabled: z.boolean(),
  created_at: z.date(),
  updated_at: z.date(),
});

export const AIAgentCreateSchema = z.object({
  name: z.string().min(1),
  agent_type: z.string().min(1),
  description: z.string().optional(),
  system_prompt: z.string().optional(),
  model_name: z.string().optional(),
  temperature: z.number().min(0).max(2).default(0.7),
  max_tokens: z.number().optional(),
});

// LLM Settings schemas
export const LLMSettingsSchema = z.object({
  id: z.number(),
  provider: z.string(),
  api_key_encrypted: z.string(),
  model_name: z.string().optional(),
  temperature: z.number().min(0).max(2),
  max_tokens: z.number().optional(),
  is_active: z.boolean(),
  created_at: z.date(),
  updated_at: z.date(),
});

export const LLMSettingsCreateSchema = z.object({
  provider: z.string().min(1),
  api_key: z.string().min(1),
  model_name: z.string().optional(),
  temperature: z.number().min(0).max(2).default(0.7),
  max_tokens: z.number().optional(),
});

// Property schemas
export const PropertyTypeSchema = z.enum([
  'residential',
  'commercial',
  'land',
  'industrial',
  'multi-family',
]);

export const PropertySchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string().optional(),
  address: z.string(),
  city: z.string(),
  state: z.string(),
  zip_code: z.string(),
  property_type: PropertyTypeSchema,
  price: z.number().positive(),
  bedrooms: z.number().optional(),
  bathrooms: z.number().optional(),
  square_feet: z.number().optional(),
  property_image_url: z.string().url().optional(),
  agent_id: z.number().optional(),
  created_at: z.date(),
  updated_at: z.date(),
});

export const PropertyCreateSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().optional(),
  address: z.string().min(5),
  city: z.string().min(2),
  state: z.string().min(2),
  zip_code: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid zip code'),
  property_type: PropertyTypeSchema,
  price: z.number().positive('Price must be positive'),
  bedrooms: z.number().int().optional(),
  bathrooms: z.number().optional(),
  square_feet: z.number().int().optional(),
});

// API Response wrapper
export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z.string().optional(),
    message: z.string().optional(),
  });

export type User = z.infer<typeof UserSchema>;
export type UserRegistration = z.infer<typeof UserRegistrationSchema>;
export type Message = z.infer<typeof MessageSchema>;
export type MessageCreate = z.infer<typeof MessageCreateSchema>;
export type Contact = z.infer<typeof ContactSchema>;
export type ContactCreate = z.infer<typeof ContactCreateSchema>;
export type Property = z.infer<typeof PropertySchema>;
export type PropertyCreate = z.infer<typeof PropertyCreateSchema>;
