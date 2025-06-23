TODO : BENERKEN ISSUE DIMANA INPUT KATEGORI TIDAK BEKERJA JIKA OPTIONS TERDAPAT WHITE SPACE


<!-- Command to edit and create user di db inventory -->
INSERT INTO users (username, password_hash, full_name, role)
VALUES (
  'johndoe',             -- username
  'P@ssw0rd123',         -- plain-text password (will be hashed by trigger)
  'John Doe',            -- full name
  'operator'             -- one of: 'field', 'operator', 'super_admin'
)
RETURNING user_id, username, full_name, role, created_at;



UPDATE users
SET
  username      = 'john.updated',       -- new username
  password_hash = 'N3wP@ssw0rd!',       -- new plain-text password
  full_name     = 'John Q. Updated',    -- new full name
  role          = 'super_admin'         -- new role
WHERE user_id = 42                       -- target user_id
RETURNING user_id, username, full_name, role, created_at;
