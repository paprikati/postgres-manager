UPDATE grandparents SET name = 'Nanny Ogg' WHERE id = $1
SELECT id FROM parents WHERE grandparent_id = $1
UPDATE parents SET name = 'Parent 0', grandparent_id = $1 WHERE id = $2
UPDATE parents SET name = 'Parent 1', grandparent_id = $1 WHERE id = $3
SELECT id FROM children WHERE parent_id = $2
UPDATE homes SET name = 'New Home Name', parent_id = $2, grandparent_id = $1 WHERE parent_id = $2
UPDATE children SET name = 'New Child Name', parent_id = $2, grandparent_id = $1 WHERE id = $4
UPDATE children SET name = 'Child 0-1', parent_id = $2, grandparent_id = $1 WHERE id = $5
SELECT id FROM children WHERE parent_id = $3
UPDATE homes SET name = 'Home 1', parent_id = $3, grandparent_id = $1 WHERE parent_id = $3
UPDATE children SET name = 'Child 1-0', parent_id = $3, grandparent_id = $1 WHERE id = $6
UPDATE children SET name = 'Child 1-1', parent_id = $3, grandparent_id = $1 WHERE id = $7