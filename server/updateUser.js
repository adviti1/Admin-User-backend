const mongoose = require('mongoose');
const Admin = require('../models/Admin');

mongoose.connect('mongodb://localhost:27017/node_crud', { useNewUrlParser: true, useUnifiedTopology: true });

Admin.findOneAndUpdate({ email: 'adviti23@gmail.com' }, { isAdmin: true }, { new: true }, (err, doc) => {
    if (err) {
        console.error('Error updating user:', err);
    } else {
        console.log('User updated:', doc);
    }
    mongoose.connection.close();
});
