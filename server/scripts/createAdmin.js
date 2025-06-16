require('dotenv').config();
const { User, sequelize } = require('../auth');
const bcrypt = require('bcryptjs');

async function createAdminUser() {
  try {
    // Wait for database connection
    await sequelize.authenticate();
    console.log('Database connected');
    
    // Check if admin user already exists
    let user = await User.findOne({ where: { email: 'admin@kubic.com' } });
    
    if (user) {
      console.log('Admin user already exists');
      // Ensure the user is an admin
      if (!user.isAdmin) {
        await user.update({ isAdmin: true });
        console.log('Updated existing user to admin');
      }
      
      // Reset the password to ensure it works
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await user.update({ password: hashedPassword });
      console.log('Reset admin password');
    } else {
      // Create the admin user
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      user = await User.create({
        email: 'admin@kubic.com',
        password: hashedPassword,
        displayName: 'Admin User',
        isAdmin: true,
        trueskill_mu: 5.0,
        trueskill_sigma: 1.67,
        responseCount: 30  // Set above MIN_ANSWERS to have a visible masteryScore
      });
      
      console.log('Admin user created successfully');
    }
    
    // Verify the user state
    const adminUser = await User.findOne({ where: { email: 'admin@kubic.com' } });
    console.log('Admin user details:', {
      id: adminUser.id,
      email: adminUser.email,
      displayName: adminUser.displayName,
      isAdmin: adminUser.isAdmin,
      responseCount: adminUser.responseCount
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
    console.log('Database connection closed');
    process.exit();
  }
}

// Run the function
createAdminUser();
