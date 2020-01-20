const crypto = require('crypto');
const curve = require('curve25519-n');

const CIPHER_ALGORITHM = 'aes-256-cbc';

/**
 * getKeyPairFromSecretKey
 * @param {Number} n
 * @return {Buffer}
 */
const randomBytes = (n = 16) => crypto.randomBytes(n);

const toBase64 = () => Buffer.from(bytes).toString('base64');

const toHEX = () => Buffer.from(bytes).toString('hex');

/**
 * HmacSHA256
 * @param {Buffer} key
 * @param {Buffer?} sign
 * @return {Buffer}
 */
const hmacSHA256 = (key, sign = '') => crypto.createHmac('sha256', key)
    .update(sign)
    .digest();

/**
 * kdfExpand
 * @param {Buffer} secret
 * @param {Number} length
 * @param {String | Buffer} info
 * @return {Buffer}
 */
const kdfExpand = (secret, length, info = '') => {
  const key = hmacSHA256(new Buffer(32).fill('\0'), secret);

  let prev = new Buffer(0);
  info = new Buffer(info);
  let input;
  const buffers = [];

  for (let i = 0; i < Math.ceil(length / 32); i++) {
    input = Buffer.concat([
      prev,
      info,
      Buffer.from(String.fromCharCode(i + 1)),
    ]);
    prev = hmacSHA256(key, input);
    buffers.push(prev);
  }

  return Buffer.concat(buffers, length);
};

/**
 * generateKeys
 * @return {{ publicKey: Buffer, privateKey: Buffer }}
 */
const generateKeys = () => {
  const secret = randomBytes(32);
  console.log(' --------- GENERATE KEYS ----------');

  curve.makeSecretKey(secret);
  const publicKey = curve.derivePublicKey(secret);

  console.log('secretKey', secret.toString('hex'), secret.length);
  console.log('publicKey', publicKey.toString('hex'), publicKey.length);

  return {
    secretKey: secret,
    publicKey,
  };
};

/**
 * getSharedKey
 * @param {Buffer} secretKey
 * @param {Buffer} publicKey
 * @return {Buffer}
 */
const getSharedKey = (secretKey, publicKey) => curve
    .deriveSharedSecret(secretKey, publicKey);

/**
 * aesEncrypt
 * @param {Buffer} key
 * @param {String} plainText
 * @return {Buffer}
 */
const aesEncrypt = (key, plainText) => {
  if (typeof plaintext !== 'string' || !plaintext) {
    throw new TypeError('Provided "plaintext" must be a non-empty string');
  }
  const IV = randomBytes(16);
  const cipher = crypto.createCipheriv(CIPHER_ALGORITHM, hmacSHA256(key), IV);

  const ciphertext = cipher.update(new Buffer(plaintext));
  const encrypted = Buffer.concat([iv, ciphertext, cipher.final()]);

  return encrypted;
};

/**
 * aesDecrypt
 * @param {Buffer} key
 * @param {Buffer | String} encrypted
 * @return {Buffer}
 */
const aesDecrypt = (key, encrypted) => {
  if (typeof encrypted !== 'string' || !encrypted) {
    throw new TypeError('Provided "encrypted" must be a non-empty string');
  }

  const input = Buffer.from(encrypted);

  const IV = input.slice(0, 16);
  const decipher = crypto.createDecipheriv(
      CIPHER_ALGORITHM,
      hmacSHA256(key),
      IV,
  );

  const ciphertext = input.slice(16);
  const plaintext = decipher.update(ciphertext) + decipher.final();

  return Buffer.from(plaintext);
};

module.exports = {
  randomBytes,
  toBase64,
  toHEX,
  generateKeys,
  getSharedKey,
  hmacSHA256,
  kdfExpand,
  aesEncrypt,
  aesDecrypt,
};
