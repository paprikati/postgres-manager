SELECT * from grandparents WHERE id = $1
SELECT * from parents WHERE grandparent_id IN ($1)
SELECT * from children WHERE parent_id IN ($2,$3)
SELECT * from homes WHERE parent_id IN ($2,$3)
