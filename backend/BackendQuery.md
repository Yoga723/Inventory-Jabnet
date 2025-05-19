# Query for inventory jabnet
add user :
INSERT INTO public.users ( username, password_hash, full_name, role) VALUES ( 'nama', 'password', 'full_name', 'field, operator, super-admin' );

INSERT INTO users ( username, password_hash, full_name, role) VALUES ( 'tomi', 'password', 'Tomi', 'field' );



CREATE TYPE role AS ENUM ('field', 'operator', 'super_admin');


ALTER TABLE users
  ALTER COLUMN role TYPE varchar(255);
