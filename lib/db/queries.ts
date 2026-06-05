import { query } from './index';
import { User, Property, Message, Contact, Deal } from './types';

// User queries
export async function getUserById(id: number): Promise<User | null> {
  const result = await query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0] || null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0] || null;
}

export async function getAllUsers(): Promise<User[]> {
  const result = await query('SELECT * FROM users ORDER BY created_at DESC');
  return result.rows;
}

export async function getUsersByRole(role: 'consumer' | 'middleman' | 'agent'): Promise<User[]> {
  const result = await query('SELECT * FROM users WHERE role = $1 ORDER BY created_at DESC', [role]);
  return result.rows;
}

export async function createUser(user: {
  email: string;
  name: string;
  password_hash: string;
  role: 'consumer' | 'middleman' | 'agent';
  phone?: string;
  avatar_url?: string;
  bio?: string;
}): Promise<User> {
  const result = await query(
    `INSERT INTO users (email, name, password_hash, role, phone, avatar_url, bio) 
     VALUES ($1, $2, $3, $4, $5, $6, $7) 
     RETURNING *`,
    [user.email, user.name, user.password_hash, user.role, user.phone, user.avatar_url, user.bio]
  );
  return result.rows[0];
}

// Property queries
export async function getPropertyById(id: number): Promise<Property | null> {
  const result = await query('SELECT * FROM properties WHERE id = $1', [id]);
  return result.rows[0] || null;
}

export async function getPropertiesByCity(city: string, limit: number = 20, offset: number = 0): Promise<Property[]> {
  const result = await query(
    'SELECT * FROM properties WHERE city = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
    [city, limit, offset]
  );
  return result.rows;
}

export async function getPropertiesByAgent(agentId: number, limit: number = 20, offset: number = 0): Promise<Property[]> {
  const result = await query(
    'SELECT * FROM properties WHERE agent_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
    [agentId, limit, offset]
  );
  return result.rows;
}

export async function getPropertiesByPriceRange(minPrice: number, maxPrice: number, limit: number = 20, offset: number = 0): Promise<Property[]> {
  const result = await query(
    'SELECT * FROM properties WHERE price BETWEEN $1 AND $2 ORDER BY price ASC LIMIT $3 OFFSET $4',
    [minPrice, maxPrice, limit, offset]
  );
  return result.rows;
}

export async function getPropertiesByType(type: string, limit: number = 20, offset: number = 0): Promise<Property[]> {
  const result = await query(
    'SELECT * FROM properties WHERE property_type = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
    [type, limit, offset]
  );
  return result.rows;
}

export async function createProperty(property: {
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
}): Promise<Property> {
  const result = await query(
    `INSERT INTO properties (title, description, address, city, state, zip_code, property_type, price, bedrooms, bathrooms, square_feet, property_image_url, agent_id) 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
     RETURNING *`,
    [
      property.title,
      property.description,
      property.address,
      property.city,
      property.state,
      property.zip_code,
      property.property_type,
      property.price,
      property.bedrooms,
      property.bathrooms,
      property.square_feet,
      property.property_image_url,
      property.agent_id,
    ]
  );
  return result.rows[0];
}

export async function updateProperty(id: number, updates: Partial<Property>): Promise<Property> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  Object.entries(updates).forEach(([key, value]) => {
    if (key !== 'id' && key !== 'created_at') {
      fields.push(`${key} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    }
  });

  values.push(id);
  const result = await query(
    `UPDATE properties SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramIndex} RETURNING *`,
    values
  );
  return result.rows[0];
}

export async function deleteProperty(id: number): Promise<void> {
  await query('DELETE FROM properties WHERE id = $1', [id]);
}

// Message queries
export async function getMessagesBetweenUsers(userId1: number, userId2: number, limit: number = 50, offset: number = 0): Promise<Message[]> {
  const result = await query(
    `SELECT * FROM messages 
     WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1)
     ORDER BY created_at DESC LIMIT $3 OFFSET $4`,
    [userId1, userId2, limit, offset]
  );
  return result.rows;
}

export async function getUnreadMessageCount(userId: number): Promise<number> {
  const result = await query(
    'SELECT COUNT(*) as count FROM messages WHERE receiver_id = $1 AND is_read = false',
    [userId]
  );
  return parseInt(result.rows[0].count, 10);
}

export async function createMessage(message: {
  sender_id: number;
  receiver_id: number;
  content: string;
  property_id?: number;
}): Promise<Message> {
  const result = await query(
    `INSERT INTO messages (sender_id, receiver_id, content, property_id) 
     VALUES ($1, $2, $3, $4) 
     RETURNING *`,
    [message.sender_id, message.receiver_id, message.content, message.property_id]
  );
  return result.rows[0];
}

export async function markMessageAsRead(messageId: number): Promise<void> {
  await query(
    'UPDATE messages SET is_read = true, read_at = CURRENT_TIMESTAMP WHERE id = $1',
    [messageId]
  );
}

// Contact queries
export async function getContactsByUser(userId: number, limit: number = 50, offset: number = 0): Promise<Contact[]> {
  const result = await query(
    'SELECT * FROM contacts WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
    [userId, limit, offset]
  );
  return result.rows;
}

export async function getContactsByType(userId: number, contactType: string, limit: number = 50, offset: number = 0): Promise<Contact[]> {
  const result = await query(
    'SELECT * FROM contacts WHERE user_id = $1 AND contact_type = $2 ORDER BY created_at DESC LIMIT $3 OFFSET $4',
    [userId, contactType, limit, offset]
  );
  return result.rows;
}

export async function getFavoriteContacts(userId: number): Promise<Contact[]> {
  const result = await query(
    'SELECT * FROM contacts WHERE user_id = $1 AND is_favorite = true ORDER BY contact_name ASC',
    [userId]
  );
  return result.rows;
}

export async function createContact(contact: {
  user_id: number;
  contact_email: string;
  contact_name: string;
  contact_phone?: string;
  contact_type: string;
  company?: string;
  notes?: string;
}): Promise<Contact> {
  const result = await query(
    `INSERT INTO contacts (user_id, contact_email, contact_name, contact_phone, contact_type, company, notes) 
     VALUES ($1, $2, $3, $4, $5, $6, $7) 
     RETURNING *`,
    [
      contact.user_id,
      contact.contact_email,
      contact.contact_name,
      contact.contact_phone,
      contact.contact_type,
      contact.company,
      contact.notes,
    ]
  );
  return result.rows[0];
}

export async function updateContact(id: number, updates: Partial<Contact>): Promise<Contact> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  Object.entries(updates).forEach(([key, value]) => {
    if (key !== 'id' && key !== 'user_id' && key !== 'created_at') {
      fields.push(`${key} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    }
  });

  values.push(id);
  const result = await query(
    `UPDATE contacts SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramIndex} RETURNING *`,
    values
  );
  return result.rows[0];
}

export async function deleteContact(id: number): Promise<void> {
  await query('DELETE FROM contacts WHERE id = $1', [id]);
}

// Deal queries
export async function getDealsByConsumer(consumerId: number): Promise<Deal[]> {
  const result = await query(
    'SELECT * FROM deals WHERE consumer_id = $1 ORDER BY created_at DESC',
    [consumerId]
  );
  return result.rows;
}

export async function getDealsByAgent(agentId: number): Promise<Deal[]> {
  const result = await query(
    'SELECT * FROM deals WHERE agent_id = $1 ORDER BY created_at DESC',
    [agentId]
  );
  return result.rows;
}

export async function getDealsByProperty(propertyId: number): Promise<Deal[]> {
  const result = await query(
    'SELECT * FROM deals WHERE property_id = $1 ORDER BY created_at DESC',
    [propertyId]
  );
  return result.rows;
}

export async function createDeal(deal: {
  property_id: number;
  consumer_id: number;
  middleman_id?: number;
  agent_id?: number;
  deal_amount: number;
}): Promise<Deal> {
  const result = await query(
    `INSERT INTO deals (property_id, consumer_id, middleman_id, agent_id, status, deal_amount) 
     VALUES ($1, $2, $3, $4, 'pending', $5) 
     RETURNING *`,
    [deal.property_id, deal.consumer_id, deal.middleman_id, deal.agent_id, deal.deal_amount]
  );
  return result.rows[0];
}

export async function updateDealStatus(dealId: number, status: 'pending' | 'in_progress' | 'completed' | 'cancelled'): Promise<Deal> {
  const result = await query(
    'UPDATE deals SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
    [status, dealId]
  );
  return result.rows[0];
}
