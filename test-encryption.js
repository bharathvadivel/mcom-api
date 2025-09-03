// Simple test for encryption functions
const { encrypt, decrypt } = require('./dist/utils/crypto');

try {
  const testData = "192.168.1.100";
  console.log("Original:", testData);
  
  const encrypted = encrypt(testData);
  console.log("Encrypted:", encrypted);
  
  const decrypted = decrypt(encrypted);
  console.log("Decrypted:", decrypted);
  
  console.log("Match:", testData === decrypted);
} catch (error) {
  console.error("Error:", error.message);
}
