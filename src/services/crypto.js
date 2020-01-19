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
 */
const kdfExpand = (secret, length, info = '') => {
  const initKey = new Buffer(32).fill('0');
  const key = hmacSHA256(initKey, secret);
  const HASH_LENGTH = 256;

  const output = new Buffer(length);
  let prev = '';
  let input;

  for (let i = 0; i < Math.ceil(length / HASH_LENGTH); i++) {
    input = hmacSHA256(key, prev + info + (0x01 * (i+1)));
    prev = input;
    output.write(input, HASH_LENGTH * i, HASH_LENGTH, 'binary');
  }
};

/**
 * generateKeys
 * @return {{ publicKey: Buffer, privateKey: Buffer }}
 */
const generateKeys = () => {
  const secret = randomBytes(32);

  return {
    privateKey: curve.makeSecretKey(secret),
    publicKey: curve.derivePublicKey(secret),
  };
};

/**
 * getSharedKey
 * @param {Buffer} privateKey
 * @param {Buffer} publicKey
 * @return {Buffer}
 */
const getSharedKey = (privateKey, publicKey) => curve
    .deriveSharedSecret(Buffer.from(privateKey), Buffer.from(publicKey));


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
