-- functions.sql: CREATE FUNCTION and CREATE PROCEDURE definitions

CREATE OR REPLACE FUNCTION get_user_name(user_id INTEGER)
RETURNS TEXT
LANGUAGE sql
AS $$
  SELECT name FROM users WHERE id = user_id;
$$;

CREATE OR REPLACE FUNCTION calculate_order_total(order_id INTEGER)
RETURNS NUMERIC
LANGUAGE sql
AS $$
  SELECT total FROM orders WHERE id = order_id;
$$;

CREATE OR REPLACE FUNCTION count_user_orders(user_id INTEGER)
RETURNS INTEGER
LANGUAGE sql
AS $$
  SELECT COUNT(*) FROM orders WHERE user_id = user_id;
$$;
