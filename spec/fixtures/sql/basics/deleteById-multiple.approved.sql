SELECT id from people WHERE id IN ($1,$2)
DELETE FROM people WHERE id IN ($1,$2)
