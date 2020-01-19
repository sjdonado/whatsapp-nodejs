const WebSocketService = require("./ws");
const cryptoService = require("./crypto");
const { qrToFile } = require("../utils");

/**
 * WhatsApp Service
 *
 * @author krthr
 */
class WhatsAppService {
  constructor() {
    this.connectionOpts = {
      clientToken: null,
      serverId: null,
      serverToken: null,
      browserToken: null,
      me: null,
      secret: null,
      sharedSecret: null
    };

    this.loginInfo = {
      clientId: null,
      serverRef: null,
      publicKey: null,
      secretKey: null,
      key: {
        encKey: null,
        macKey: null
      }
    };

    this.messagesQueue = {};
  }

  /**
   * Send a "ping" message every 25 seconds.
   */
  ping() {
    setTimeout(() => {
      this.ws.send("?,,");
      this.ping();
    }, 25000);
  }

  /**
   * Handle a received message.
   * @param {String} message
   */
  handleMessage(message = "") {
    let [tag, ...content] = message.split(",");
    content = content.join();

    // TODO
  }

  /**
   * Generate the QR image.
   *
   * 1. Get the `serverRef` from the content of the response
   * 2. Generate public and secret keys
   * 3. Concatenate the following values with comma:
   *    - serverRef
   *    - `Base64(publicKey)`
   *    - clientId
   *
   * @param {String} content
   */
  generateQR(content) {
    this.loginInfo.serverRef = JSON.parse(content).ref;

    const { publicKey, secretKey } = cryptoService.generateKeys();
    this.loginInfo.secretKey = secretKey;
    this.loginInfo.publicKey = publicKey;

    const qrCode =
      this.loginInfo.serverRef +
      cryptoService.toBase64(this.loginInfo.publicKey) +
      this.loginInfo.clientId;

    qrToFile(qrCode);
  }

  /**
   * Initialize the communication with the API.
   *
   * 1. Generate a new Client ID (16 random bytes converted to Base64)
   * 2. Send the message `<message_tag>,["admin","init",[0,4,315],["Windows","Chrome","10"],"<client_id>",true]`
   */
  init() {
    this.loginInfo.clientId = cryptoService.randomBytes().toString("base64");
    const messageTag = Date.now();
    this.ws.send(
      `${messageTag},["admin","init",[0,4,315],["Windows","Chrome","10"],"${this.loginInfo.clientId}",true]`
    );
  }

  /**
   * Start the websocket connection and start listening the ws events.
   */
  start() {
    this.ws = new WebSocketService();
    this.ws.on("open", () => this.init());
    this.ws.on("close", () => null);
    this.ws.on("error", () => null);
    this.ws.on("message", this.handleMessage.bind(this));
  }
}

module.exports = WhatsAppService;
