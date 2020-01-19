const crypto = require("crypto");
const nacl = require("tweetnacl");

class CryptoService {
  generateBytes(n = 16) {
    return crypto.randomBytes(n);
  }

  bytesToBase64(bytes = new Buffer()) {
    return bytes.toString("base64");
  }

  generateKeys() {
    const { publicKey, secretKey } = nacl.box.keyPair();

    return {
      publicKey: Buffer.from(publicKey).toString("base64"),
      secretKey: Buffer.from(secretKey).toString("base64")
    };
  }
}

module.exports = new CryptoService();
