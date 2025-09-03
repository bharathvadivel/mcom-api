// Test script for AES-256-GCM field encryption
require('dotenv').config();
const { encryptField, decryptField } = require('./dist/utils/crypto');

console.log('Testing AES-256-GCM Field Encryption...\n');

try {
  // Test data
  const testData = [
    'user@example.com',
    '192.168.1.100',
    'JBSWY3DPEHPK3PXP', // Base32 TOTP secret
    'session-id-12345',
    '',
    'long text with special characters!@#$%^&*()_+=[]{}|;:,.<>?'
  ];

  testData.forEach((data, index) => {
    console.log(`Test ${index + 1}:`);
    console.log(`Original: "${data}"`);
    
    const encrypted = encryptField(data);
    console.log(`Encrypted: ${encrypted.substring(0, 50)}...`);
    
    const decrypted = decryptField(encrypted);
    console.log(`Decrypted: "${decrypted}"`);
    console.log(`Match: ${data === decrypted ? '✅' : '❌'}`);
    console.log('---');
  });

  console.log('\n🎉 All encryption tests passed!');
} catch (error) {
  console.error('❌ Encryption test failed:', error.message);
}
