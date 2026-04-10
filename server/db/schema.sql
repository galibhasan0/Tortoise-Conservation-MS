-- AURA Shell Database Schema
-- ============================================

CREATE TABLE IF NOT EXISTS roles (
  role_id SERIAL PRIMARY KEY,
  role_name VARCHAR(100) UNIQUE NOT NULL,
  role_code VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS permissions (
  permission_id SERIAL PRIMARY KEY,
  permission_key VARCHAR(100) UNIQUE NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS role_permissions (
  role_id INT NOT NULL REFERENCES roles(role_id) ON DELETE CASCADE,
  permission_id INT NOT NULL REFERENCES permissions(permission_id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS users (
  user_id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role_id INT NOT NULL REFERENCES roles(role_id),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive','suspended')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_profiles (
  profile_id SERIAL PRIMARY KEY,
  user_id INT UNIQUE NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  full_name VARCHAR(200),
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  avatar TEXT,
  bio TEXT
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  token_id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  token UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS species (
  species_id SERIAL PRIMARY KEY,
  species_name VARCHAR(200) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS enclosures (
  enclosure_id SERIAL PRIMARY KEY,
  enclosure_name VARCHAR(100) UNIQUE NOT NULL,
  location VARCHAR(200),
  capacity INT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tortoise_profiles (
  tortoise_id SERIAL PRIMARY KEY,
  tortoise_code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  species_id INT REFERENCES species(species_id),
  date_of_birth DATE,
  gender VARCHAR(10) DEFAULT 'Unknown' CHECK (gender IN ('Male','Female','Unknown')),
  weight NUMERIC(8,2),
  carapace_length NUMERIC(8,2),
  enclosure_id INT REFERENCES enclosures(enclosure_id),
  health_status VARCHAR(30) DEFAULT 'Healthy' CHECK (health_status IN ('Healthy','Injured','Ill','Under Treatment','Deceased')),
  notes TEXT,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS feeding_logs (
  log_id SERIAL PRIMARY KEY,
  tortoise_id INT NOT NULL REFERENCES tortoise_profiles(tortoise_id),
  food_type VARCHAR(200) NOT NULL,
  quantity_grams NUMERIC(8,2),
  fed_by_user_id INT REFERENCES users(user_id),
  fed_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS health_records (
  record_id SERIAL PRIMARY KEY,
  tortoise_id INT NOT NULL REFERENCES tortoise_profiles(tortoise_id),
  condition VARCHAR(200) NOT NULL,
  symptoms TEXT,
  diagnosis TEXT,
  treatment TEXT,
  vet_user_id INT REFERENCES users(user_id),
  weight_at_exam NUMERIC(8,2),
  examined_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  notes TEXT,
  severity VARCHAR(20) DEFAULT 'low' CHECK (severity IN ('low','medium','high','critical')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS breeding_records (
  record_id SERIAL PRIMARY KEY,
  male_tortoise_id INT NOT NULL REFERENCES tortoise_profiles(tortoise_id),
  female_tortoise_id INT NOT NULL REFERENCES tortoise_profiles(tortoise_id),
  mating_date DATE,
  egg_count INT,
  hatch_count INT,
  hatch_date DATE,
  outcome VARCHAR(20) DEFAULT 'Pending' CHECK (outcome IN ('Pending','Successful','Failed','Cancelled')),
  officer_user_id INT REFERENCES users(user_id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS environment_logs (
  log_id SERIAL PRIMARY KEY,
  enclosure_id INT NOT NULL REFERENCES enclosures(enclosure_id),
  temperature_celsius NUMERIC(5,2),
  humidity_percent NUMERIC(5,2),
  uv_index NUMERIC(4,2),
  light_hours NUMERIC(4,2),
  source VARCHAR(50) DEFAULT 'manual',
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tasks (
  task_id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low','medium','high')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','in_progress','completed','verified','overdue','cancelled')),
  due_date DATE,
  assigned_to_user_id INT REFERENCES users(user_id),
  created_by_user_id INT REFERENCES users(user_id),
  category VARCHAR(100),
  tortoise_id INT REFERENCES tortoise_profiles(tortoise_id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS task_status_history (
  history_id SERIAL PRIMARY KEY,
  task_id INT NOT NULL REFERENCES tasks(task_id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL,
  changed_by_user_id INT REFERENCES users(user_id),
  notes TEXT,
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS alerts (
  alert_id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  severity VARCHAR(20) DEFAULT 'info' CHECK (severity IN ('info','warning','high','critical')),
  alert_type VARCHAR(30) DEFAULT 'operational' CHECK (alert_type IN ('medical','environmental','operational','security')),
  tortoise_id INT REFERENCES tortoise_profiles(tortoise_id),
  enclosure_id INT REFERENCES enclosures(enclosure_id),
  created_by_user_id INT REFERENCES users(user_id),
  assigned_to_user_id INT REFERENCES users(user_id),
  assigned_to_role_id INT REFERENCES roles(role_id),
  resolved_at TIMESTAMPTZ,
  resolved_by_user_id INT REFERENCES users(user_id),
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS alert_action_history (
  action_id SERIAL PRIMARY KEY,
  alert_id INT NOT NULL REFERENCES alerts(alert_id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL,
  performed_by_user_id INT REFERENCES users(user_id),
  notes TEXT,
  action_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  notification_id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  message TEXT,
  type VARCHAR(50) DEFAULT 'info',
  entity_type VARCHAR(50),
  entity_id INT,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  log_id SERIAL PRIMARY KEY,
  actor_user_id INT REFERENCES users(user_id),
  role_id INT REFERENCES roles(role_id),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id TEXT,
  before_json JSONB,
  after_json JSONB,
  ip_address VARCHAR(50),
  request_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_tortoise_health ON tortoise_profiles(health_status);
CREATE INDEX IF NOT EXISTS idx_tortoise_enclosure ON tortoise_profiles(enclosure_id);
CREATE INDEX IF NOT EXISTS idx_tortoise_deleted ON tortoise_profiles(deleted_at);
CREATE INDEX IF NOT EXISTS idx_feeding_tortoise ON feeding_logs(tortoise_id);
CREATE INDEX IF NOT EXISTS idx_feeding_date ON feeding_logs(fed_at);
CREATE INDEX IF NOT EXISTS idx_health_tortoise ON health_records(tortoise_id);
CREATE INDEX IF NOT EXISTS idx_breeding_male ON breeding_records(male_tortoise_id);
CREATE INDEX IF NOT EXISTS idx_breeding_female ON breeding_records(female_tortoise_id);
CREATE INDEX IF NOT EXISTS idx_env_enclosure ON environment_logs(enclosure_id);
CREATE INDEX IF NOT EXISTS idx_env_time ON environment_logs(recorded_at);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON tasks(assigned_to_user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);
CREATE INDEX IF NOT EXISTS idx_alerts_resolved ON alerts(resolved_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read_at);
CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_logs(actor_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);
