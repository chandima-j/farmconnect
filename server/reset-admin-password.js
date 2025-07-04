import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetAdminPassword() {
  try {
    // Get new password from command line or use default
    const newPassword = process.argv[2] || 'NewAdminPassword123!';
    
    console.log('🔐 Resetting admin password...');
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    // Update the admin user
    const updatedAdmin = await prisma.user.update({
      where: { email: 'admin@farmconnect.com' },
      data: { password: hashedPassword }
    });
    
    console.log('✅ Admin password reset successfully!');
    console.log(`📧 Email: ${updatedAdmin.email}`);
    console.log(`🔑 New password: ${newPassword}`);
    console.log('⚠️  Remember to change this password after logging in!');
    
  } catch (error) {
    console.error('❌ Error resetting admin password:', error.message);
    if (error.code === 'P2025') {
      console.error('❌ Admin user not found. Run the seed script first.');
    }
  } finally {
    await prisma.$disconnect();
  }
}

resetAdminPassword(); 