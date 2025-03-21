const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./server/models/Admin'); // Adjust the path as needed

const mongoURI = 'mongodb://localhost:27017/node_crud'; // Update with your actual database name

mongoose.connect(mongoURI)
    .then(async () => {
        console.log('MongoDB connected');

        const email = 'admin@example.com'; // Email of the admin to update
        const newPassword = 'newadminpassword'; // New plain text password

        try {
            // Find the admin by email
            const admin = await Admin.findOne({ email });
            if (!admin) {
                console.log('Admin not found');
                mongoose.connection.close();
                return;
            }

            // Hash the new password
            const salt = await bcrypt.genSalt(10);
            admin.password = await bcrypt.hash(newPassword, salt);

            // Save the updated admin
            await admin.save();
            console.log('Admin password updated successfully:', admin);
        } catch (err) {
            console.error('Error updating admin:', err);
        } finally {
            mongoose.connection.close();
        }
    })
    .catch(err => {
        console.error('Error:', err);
        mongoose.connection.close();
    });
