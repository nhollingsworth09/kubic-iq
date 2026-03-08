const { User } = require('../auth');
const bcrypt = require('bcryptjs');

async function createAdminUser() {
  try {
    // Check if admin user already exists
    let user = await User.findOne({ where: { email: 'admin@kubic.com' } });
    
    if (user) {
      // Ensure the user is an admin and password is correct
      const hashedPassword = await bcrypt.hash('admin', 10);
      await user.update({ isAdmin: true, password: hashedPassword });
      console.log('Admin user already exists. Password and admin status verified.');
    } else {
      // Create the admin user
      const hashedPassword = await bcrypt.hash('admin', 10);

      user = await User.create({
        email: 'admin@kubic.com',
        password: hashedPassword,
        displayName: 'Admin User',
        isAdmin: true,
        trueskill_mu: 7.0,
        trueskill_sigma: 1.67,
        responseCount: 30  // Set above MIN_ANSWERS to have a visible masteryScore
      });

      console.log('Admin user created with the following credentials:');
      console.log('Email: admin@kubic.com');
      console.log('Password: admin');
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

// If called directly, run the function right away
if (require.main === module) {
  createAdminUser();
}

// Export for use in server startup
module.exports = createAdminUser;
