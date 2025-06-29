const bcrypt = require('bcryptjs');

// Hash the password 'password123'
const password = 'password123';
const saltRounds = 12;

bcrypt.hash(password, saltRounds, function(err, hash) {
    if (err) {
        console.error('Error hashing password:', err);
    } else {
        console.log('Password hash for "password123":');
        console.log(hash);
    }
});
