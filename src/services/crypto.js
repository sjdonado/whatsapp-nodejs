const crypto = require("crypto");
const nacl = require("tweetnacl");

/**
 * getKeyPairFromSecretKey
 * @param {Number} n
 * @return {Buffer}
 */
const randomBytes = (n = 16) => crypto.randomBytes(n);

/**
 * getKeyPairFromSecretKey
 * @param {Uint8Array} secretKey
 * @return {nacl.BoxKeyPair}
 */
const getKeyPairFromSecretKey = () => nacl.box.keyPair.fromSecretKey(secretKey);

/**
 * @returns {String}
 */
const toBase64 = () => Buffer.from(bytes).toString("base64");

/**
 * @returns {String}
 */
const toHEX = () => Buffer.from(bytes).toString("hex");

const generateKeys = () => nacl.box.keyPair();

module.exports = {
  randomBytes,
  toBase64,
  toHEX,
  generateKeys,
  getKeyPairFromSecretKey
};
