const crypto = require("crypto");
const nacl = require("tweetnacl");

const AES_BLOCK_SIZE = 16;

/**
 * CryptoService
 *
 * @author krthr
 */
class CryptoService {
  randomBytes(n = 16) {
    return crypto.randomBytes(n);
  }

  toBase64(bytes) {
    return Buffer.from(bytes).toString("base64");
  }

  toHEX(bytes) {
    return Buffer.from(bytes).toString("hex");
  }

  generateKeys() {
    return nacl.box.keyPair();
  }

  /**
   *
   * @param {Uint8Array} secretKey
   */
  getKeyPairFromSecretKey(secretKey) {
    return nacl.box.keyPair.fromSecretKey(secretKey);
  }

  HMACSha256(data, key) {
    return crypto
      .createHmac("sha256", key)
      .update(data)
      .digest();
  }
}

module.exports = new CryptoService();
