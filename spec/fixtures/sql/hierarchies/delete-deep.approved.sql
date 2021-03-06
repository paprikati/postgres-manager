SELECT id from grandparents WHERE id = $1
DELETE FROM grandparents WHERE id = $1
SELECT id from parents WHERE grandparent_id IN ($1)
DELETE FROM parents WHERE grandparent_id IN ($1)
SELECT id from children WHERE parent_id IN ($2,$3)
DELETE FROM children WHERE parent_id IN ($2,$3)
SELECT id from homes WHERE parent_id IN ($2,$3)
DELETE FROM homes WHERE parent_id IN ($2,$3)
SELECT id from rooms WHERE home_id IN ($4,$5)
DELETE FROM rooms WHERE home_id IN ($4,$5)