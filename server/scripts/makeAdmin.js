require('dotenv').config();
const { User, sequelize } = require('../auth');

async function makeAdmin() {
  try {
    // Wait for database connection
    await sequelize.authenticate();
    console.log('Database connected');

    const user = await User.findOne({ where: { email: 'admin@kubic.com' } });
    if (!user) {
      console.log('User not found');
      return;
    }
    
    await user.update({ isAdmin: true });
    console.log('Successfully made user admin');
    
    const updatedUser = await User.findOne({ where: { email: 'admin@kubic.com' } });
    console.log('Updated user:', {
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
    process.exit();
  }
}

makeAdmin();
