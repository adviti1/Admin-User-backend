const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./server/models/Admin'); // Adjusted the path to models folder

const mongoURI = 'mongodb://localhost:27017/node_crud'; // Replace 'yourDatabaseName' with your actual database name

mongoose.connect(mongoURI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('MongoDB connection error:', err));

const createAdmin = async () => {
    try {
        const adminData = {
            name: 'Admin Name',
            email: 'admin@example.com',
            phone: '1234567890',
            password: 'adminpassword', // Plain password, will be hashed
            isAdmin: true // Ensure this is set to true
        };

        const salt = await bcrypt.genSalt(10);
        adminData.password = await bcrypt.hash(adminData.password, salt);

        const newAdmin = new Admin(adminData);
        await newAdmin.save();

        console.log('Admin created successfully:', newAdmin);
    } catch (err) {
        console.error('Error creating admin:', err);
    } finally {
        mongoose.connection.close();
    }
};

createAdmin();
