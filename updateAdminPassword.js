const mongoose = require('mongoose');
const Admin = require('./server/models/Admin'); // Adjust the path as needed

const mongoURI = 'mongodb://localhost:27017/node_crud'; // Update with your actual database name

mongoose.connect(mongoURI)
    .then(async () => {
        console.log('MongoDB connected');

        const email = 'admin@example.com'; // The email of the admin to update
        const newPlainPassword = 'newadminpassword'; // New plain text password

        try {
            // Find the admin by email
            const admin = await Admin.findOne({ email });
            if (!admin) {
                console.log('Admin not found');
                mongoose.connection.close();
                return;
            }

            // Hash the new password and update the admin document
            admin.password = await Admin.hashPassword(newPlainPassword);
            await admin.save();

            console.log('Admin password updated successfully');
        } catch (err) {
            console.error('Error updating admin password:', err);
        } finally {
            mongoose.connection.close();
        }
    })
    .catch(err => {
        console.error('Error:', err);
        mongoose.connection.close();
    });
