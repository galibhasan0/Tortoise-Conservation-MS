-- Seed Roles
INSERT INTO roles (role_name, role_code) VALUES
  ('Admin', 'admin'),
  ('Supervisor', 'supervisor'),
  ('Vet', 'vet'),
  ('Caretaker', 'caretaker'),
  ('Breeding Officer', 'breeding_officer'),
  ('Env Tech', 'env_tech'),
  ('Collection Officer', 'collection_officer'),
  ('Staff', 'staff')
ON CONFLICT (role_code) DO NOTHING;

-- Seed Permissions
INSERT INTO permissions (permission_key, description) VALUES
  ('user.create', 'Create users'), ('user.read', 'View users'),
  ('user.update', 'Update users'), ('user.delete', 'Delete users'),
  ('role.assign', 'Assign roles'),
  ('profile.read', 'View profiles'), ('profile.update', 'Update profiles'),
  ('password.change', 'Change own password'), ('password.reset', 'Reset user passwords'),
  ('tortoise.create', 'Create tortoise'), ('tortoise.read', 'View tortoise'),
  ('tortoise.update', 'Update tortoise'), ('tortoise.delete', 'Delete tortoise'),
  ('feeding.create', 'Log feeding'), ('feeding.read', 'View feeding'),
  ('feeding.update', 'Update feeding'), ('feeding.delete', 'Delete feeding'),
  ('health.create', 'Create health record'), ('health.read', 'View health records'),
  ('health.update', 'Update health records'), ('health.delete', 'Delete health records'),
  ('health.resolve', 'Resolve health issues'),
  ('breeding.create', 'Create breeding record'), ('breeding.read', 'View breeding'),
  ('breeding.update', 'Update breeding'), ('breeding.delete', 'Delete breeding'),
  ('environment.create', 'Log environment'), ('environment.read', 'View environment'),
  ('environment.update', 'Update environment'),
  ('task.create', 'Create tasks'), ('task.read', 'View tasks'),
  ('task.update', 'Update tasks'), ('task.delete', 'Delete tasks'),
  ('task.assign', 'Assign tasks'), ('task.resolve', 'Resolve tasks'),
  ('alert.create', 'Create alerts'), ('alert.read', 'View alerts'),
  ('alert.update', 'Update alerts'), ('alert.assign', 'Assign alerts'),
  ('alert.resolve', 'Resolve alerts'),
  ('notification.read', 'View notifications'),
  ('audit.read', 'View audit logs'),
  ('report.read', 'View reports'),
  ('inventory.read', 'View inventory'), ('inventory.update', 'Update inventory')
ON CONFLICT (permission_key) DO NOTHING;

-- Admin: all permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id FROM roles r, permissions p
WHERE r.role_code = 'admin'
ON CONFLICT DO NOTHING;

-- Supervisor
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id FROM roles r, permissions p
WHERE r.role_code = 'supervisor'
  AND p.permission_key IN (
    'user.read','profile.read','profile.update','password.change',
    'tortoise.read','tortoise.update',
    'feeding.read','health.read','breeding.read','environment.read',
    'task.create','task.read','task.update','task.delete','task.assign','task.resolve',
    'alert.create','alert.read','alert.update','alert.assign','alert.resolve',
    'notification.read','report.read','audit.read'
  )
ON CONFLICT DO NOTHING;

-- Vet
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id FROM roles r, permissions p
WHERE r.role_code = 'vet'
  AND p.permission_key IN (
    'profile.read','profile.update','password.change',
    'tortoise.read','tortoise.update',
    'health.create','health.read','health.update','health.delete','health.resolve',
    'feeding.read',
    'alert.create','alert.read','alert.resolve',
    'task.read','task.update','task.resolve','notification.read'
  )
ON CONFLICT DO NOTHING;

-- Caretaker
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id FROM roles r, permissions p
WHERE r.role_code = 'caretaker'
  AND p.permission_key IN (
    'profile.read','profile.update','password.change',
    'tortoise.read',
    'feeding.create','feeding.read','feeding.update',
    'health.read',
    'task.read','task.update','task.resolve',
    'alert.read','notification.read'
  )
ON CONFLICT DO NOTHING;

-- Breeding Officer
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id FROM roles r, permissions p
WHERE r.role_code = 'breeding_officer'
  AND p.permission_key IN (
    'profile.read','profile.update','password.change',
    'tortoise.read','tortoise.update',
    'breeding.create','breeding.read','breeding.update','breeding.delete',
    'health.read','feeding.read',
    'task.read','task.update',
    'alert.read','notification.read'
  )
ON CONFLICT DO NOTHING;

-- Env Tech
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id FROM roles r, permissions p
WHERE r.role_code = 'env_tech'
  AND p.permission_key IN (
    'profile.read','profile.update','password.change',
    'tortoise.read',
    'environment.create','environment.read','environment.update',
    'alert.create','alert.read','alert.resolve',
    'task.read','task.update','notification.read'
  )
ON CONFLICT DO NOTHING;

-- Collection Officer
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id FROM roles r, permissions p
WHERE r.role_code = 'collection_officer'
  AND p.permission_key IN (
    'profile.read','profile.update','password.change',
    'tortoise.create','tortoise.read','tortoise.update',
    'health.read','feeding.read',
    'inventory.read','inventory.update',
    'task.read','task.update',
    'alert.read','notification.read'
  )
ON CONFLICT DO NOTHING;

-- Staff (minimal)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id FROM roles r, permissions p
WHERE r.role_code = 'staff'
  AND p.permission_key IN (
    'profile.read','profile.update','password.change',
    'tortoise.read','feeding.read','health.read',
    'task.read','task.update',
    'alert.read','notification.read'
  )
ON CONFLICT DO NOTHING;

-- Seed Enclosures
INSERT INTO enclosures (enclosure_name, location, capacity) VALUES
  ('Enclosure A', 'North Wing', 10),
  ('Enclosure B', 'South Wing', 8),
  ('Enclosure C', 'East Block', 12),
  ('Quarantine', 'Medical Block', 4)
ON CONFLICT (enclosure_name) DO NOTHING;

-- Seed Species
INSERT INTO species (species_name) VALUES
  ('Sulcata Tortoise'),
  ('Hermann''s Tortoise'),
  ('African Spurred Tortoise'),
  ('Leopard Tortoise'),
  ('Russian Tortoise'),
  ('Greek Tortoise')
ON CONFLICT (species_name) DO NOTHING;
