INSERT INTO grandparents (id, name) VALUES ($1, 'Nanny Ogg')
INSERT INTO parents (id, grandparent_id, name) VALUES ($2, $1, 'Parent 0'), ($3, $1, 'Parent 1')
INSERT INTO children (id, parent_id, grandparent_id, name) VALUES ($4, $2, $1, 'Child 0-0'), ($5, $2, $1, 'Child 0-1'), ($6, $3, $1, 'Child 1-0'), ($7, $3, $1, 'Child 1-1')
INSERT INTO homes (id, parent_id, grandparent_id, name) VALUES ($8, $2, $1, 'Home 0'), ($9, $3, $1, 'Home 1')
