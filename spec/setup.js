const db = require('./db');

db.drop(e1 => {
    console.log('reset completed');
    if (e1) {
        console.error(e1);
        process.exit(1);
    } else {
        db.initialise(e2 => {
            if (e2) {
                console.error(e2);
                process.exit(1);
            } else {
                console.log('done');
                process.exit(0);
            }
        });
    }
});
