UPDATE grandparents SET name = 'Nanny Ogg' WHERE id = $1
SELECT id FROM parents WHERE grandparent_id = $1
UPDATE parents SET name = 'Parent 0', grandparent_id = $1 WHERE id = $2
UPDATE parents SET name = 'Parent 1', grandparent_id = $1 WHERE id = $3
SELECT id FROM children WHERE parent_id = $2
UPDATE children SET name = 'New Child Name', parent_id = $2, grandparent_id = $1 WHERE id = $4
UPDATE children SET name = 'Child 0-1', parent_id = $2, grandparent_id = $1 WHERE id = $5
SELECT id FROM children WHERE parent_id = $3
UPDATE children SET name = 'Child 1-0', parent_id = $3, grandparent_id = $1 WHERE id = $6
UPDATE children SET name = 'Child 1-1', parent_id = $3, grandparent_id = $1 WHERE id = $7
UPDATE homes SET name = 'Home 1', parent_id = $3, grandparent_id = $1 WHERE parent_id = $3
SELECT id FROM rooms WHERE home_id = $8
UPDATE homes SET name = 'New Home Name', parent_id = $2, grandparent_id = $1 WHERE parent_id = $2
SELECT id FROM rooms WHERE home_id = $9
UPDATE rooms SET name = 'Room 0-0', home_id = $9, grandparent_id = $1, parent_id = $2 WHERE id = $10
UPDATE rooms SET name = 'Room 0-1', home_id = $9, grandparent_id = $1, parent_id = $2 WHERE id = $11
SELECT * from grandparents WHERE id = $1
SELECT * from parents WHERE grandparent_id IN ($1)
SELECT * from children WHERE parent_id IN ($2,$3)
SELECT * from homes WHERE parent_id IN ($2,$3)
SELECT * from rooms WHERE home_id IN ($8,$9)