const crypto = require('crypto');
const nacl = require('tweetnacl');

/**
 * getKeyPairFromSecretKey
 * @param {Number} n
 * @return {Buffer}
 */
const randomBytes = (n = 16) => crypto.randomBytes(n);

/**
 * getKeyPairFromSecretKey
 * @param {Uint8Array} secretKey
 * @return {{ publicKey: String, privateKey: String }}
 */
const getKeyPairFromSecretKey = () => nacl.box.keyPair.fromSecretKey(secretKey);

const toBase64 = () => Buffer.from(bytes).toString('base64');

const toHEX = () => Buffer.from(bytes).toString('hex');

const generateKeys = () => nacl.box.keyPair();

module.exports = {
  randomBytes,
  toBase64,
  toHEX,
  generateKeys,
  getKeyPairFromSecretKey,
};
