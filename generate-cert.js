import mkcert from 'mkcert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateCertificates() {
  try {
    // Create cert directory if it doesn't exist
    const certDir = path.join(__dirname, 'cert');
    if (!fs.existsSync(certDir)) {
      fs.mkdirSync(certDir);
    }

    // Generate CA certificate
    const ca = await mkcert.createCA({
      organization: 'FarmConnect Dev CA',
      countryCode: 'US',
      state: 'Development',
      locality: 'Local',
      validityDays: 365
    });

    // Generate certificate for localhost
    const cert = await mkcert.createCert({
      domains: ['localhost', '127.0.0.1'],
      validityDays: 365,
      caKey: ca.key,
      caCert: ca.cert
    });

    // Write certificate files
    fs.writeFileSync(path.join(certDir, 'cert.pem'), cert.cert);
    fs.writeFileSync(path.join(certDir, 'key.pem'), cert.key);

    console.log('✅ Self-signed certificates generated successfully!');
    console.log('📁 Certificate files created in:', certDir);
    console.log('🔐 CA Certificate:', ca.cert.substring(0, 50) + '...');
    
  } catch (error) {
    console.error('❌ Error generating certificates:', error.message);
    process.exit(1);
  }
}

generateCertificates(); 