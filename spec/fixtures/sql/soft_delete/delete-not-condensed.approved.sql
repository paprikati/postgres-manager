SELECT * from grandparents WHERE id = $1
SELECT * from parents WHERE grandparent_id IN ($1)
SELECT * from homes WHERE parent_id IN ($2,$3)
INSERT INTO deleted_grandparents (id, family) VALUES ($1, '{"id":$1,"name":"Nanny Ogg","parents":[{"id":$2,"grandparent_id":$1,"name":"Parent 0","home":{"id":$4,"parent_id":$2,"grandparent_id":$1,"name":"Home 0"}},{"id":$3,"grandparent_id":$1,"name":"Parent 1","home":{"id":$5,"parent_id":$3,"grandparent_id":$1,"name":"Home 1"}}]}')
SELECT id from grandparents WHERE id = $1
DELETE FROM grandparents WHERE id = $1
SELECT id from parents WHERE grandparent_id IN ($1)
DELETE FROM parents WHERE grandparent_id IN ($1)
SELECT id from homes WHERE parent_id IN ($2,$3)
DELETE FROM homes WHERE parent_id IN ($2,$3)