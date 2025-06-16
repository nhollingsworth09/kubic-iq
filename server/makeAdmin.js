require('dotenv').config();
const { User, sequelize } = require('./auth');

async function makeAdmin() {
  try {
    // Make sure database is initialized
    await sequelize.sync();
    
    const user = await User.findOne({ where: { email: 'admin@kubic.com' } });
    if (!user) {
      console.log('User not found');
      return;
    }
    
    await user.update({ isAdmin: true });
    const updatedUser = await User.findOne({ where: { email: 'admin@kubic.com' } });
    console.log('Updated user:', {
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      id: updatedUser.id
    });
    console.log('Successfully made user admin');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
    process.exit();
  }
}

makeAdmin();
