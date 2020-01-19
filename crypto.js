const crypto = require("crypto");
const nacl = require("tweetnacl");

/**
 *
 * @param {Number} n
 */
const generateBytes = (n = 16) => crypto.randomBytes(n);

/**
 *
 * @param {Buffer} bytes
 */
const bytesToBase64 = bytes => bytes.toString("base64");

const generateKeys = () => nacl.box.keyPair();

module.exports = {
  generateBytes,
  generateKeys,
  bytesToBase64
};
