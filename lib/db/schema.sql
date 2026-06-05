-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('consumer', 'middleman', 'agent')),
  phone VARCHAR(20),
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Properties table
CREATE TABLE IF NOT EXISTS properties (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  address VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  zip_code VARCHAR(20) NOT NULL,
  property_type VARCHAR(50) NOT NULL,
  price DECIMAL(15, 2) NOT NULL,
  bedrooms INT,
  bathrooms DECIMAL(3, 1),
  square_feet INT,
  property_image_url TEXT,
  agent_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (agent_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Deals table
CREATE TABLE IF NOT EXISTS deals (
  id SERIAL PRIMARY KEY,
  property_id INT NOT NULL,
  consumer_id INT NOT NULL,
  middleman_id INT,
  agent_id INT,
  status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  deal_amount DECIMAL(15, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
  FOREIGN KEY (consumer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (middleman_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (agent_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Commissions table
CREATE TABLE IF NOT EXISTS commissions (
  id SERIAL PRIMARY KEY,
  deal_id INT NOT NULL,
  user_id INT NOT NULL,
  commission_percentage DECIMAL(5, 2) NOT NULL,
  commission_amount DECIMAL(15, 2) NOT NULL,
  status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'paid')),
  paid_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  source VARCHAR(100),
  interested_property_type VARCHAR(100),
  budget_min DECIMAL(15, 2),
  budget_max DECIMAL(15, 2),
  middleman_id INT,
  agent_id INT,
  status VARCHAR(50) NOT NULL CHECK (status IN ('new', 'contacted', 'qualified', 'lost')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (middleman_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (agent_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Networks table (for agent partnerships)
CREATE TABLE IF NOT EXISTS networks (
  id SERIAL PRIMARY KEY,
  agent_id INT NOT NULL,
  partner_agent_id INT NOT NULL,
  status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'connected', 'inactive')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (agent_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (partner_agent_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(agent_id, partner_agent_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_properties_agent_id ON properties(agent_id);
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_deals_property_id ON deals(property_id);
CREATE INDEX IF NOT EXISTS idx_deals_consumer_id ON deals(consumer_id);
CREATE INDEX IF NOT EXISTS idx_deals_status ON deals(status);
CREATE INDEX IF NOT EXISTS idx_commissions_deal_id ON commissions(deal_id);
CREATE INDEX IF NOT EXISTS idx_commissions_user_id ON commissions(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_middleman_id ON leads(middleman_id);
CREATE INDEX IF NOT EXISTS idx_leads_agent_id ON leads(agent_id);
CREATE INDEX IF NOT EXISTS idx_networks_agent_id ON networks(agent_id);
