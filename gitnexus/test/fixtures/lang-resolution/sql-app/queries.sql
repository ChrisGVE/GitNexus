-- queries.sql: SELECT/INSERT statements that call functions defined in functions.sql

SELECT get_user_name(1);

SELECT calculate_order_total(42);

SELECT count_user_orders(1);

INSERT INTO orders (user_id, total)
VALUES (1, calculate_order_total(1));
