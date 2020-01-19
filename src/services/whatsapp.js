const WebSocketService = require("./ws");
const cryptoService = require("./crypto");
const { log, showQRCode } = require("../utils");

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
    setTimeout(() => this.ws.send("?,,") && this.ping(), 25000);
  }

  /**
   * Handle a received message.
   * @param {String | Buffer} message
   */
  handleMessage(message = "") {
    let tag, content;
    const isMessageBuffer = typeof message !== "string";

    if (!isMessageBuffer) {
      [tag, ...content] = message.split(",");
      content = content.join();
    } else {
      [tag] = message.toString().split(",");
      content = message.slice(tag.length + 1);
    }

    if (this.messagesQueue[tag]) {
      // the server responds to a client's message

      const pend = this.messagesQueue[tag];

      switch (pend.desc) {
        case "_login": {
          this.generateQR(content);
          break;
        }
        case "_status": // TODO
          break;

        case "_restoresession": // TODO
          break;
      }
    } else {
      if (!isMessageBuffer && content) {
        const obj = JSON.parse(content);

        if (obj.length) {
          // JSON content

          const [name, payload] = obj;

          switch (name) {
            case "Conn": {
              this.ping();
              this.processConn(payload);
              break;
            }
            case "Stream": {
              break;
            }
            case "Props": {
              break;
            }
          }
        }
      } else {
        if (content !== "") {
          // TODO binray content, decrypt message
        }
      }
    }
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

    this.loginInfo.secretKey = Buffer.from(secretKey);
    this.loginInfo.publicKey = Buffer.from(publicKey);

    const qrCodeText = [
      this.loginInfo.serverRef,
      this.loginInfo.publicKey.toString("base64"),
      this.loginInfo.clientId
    ].join(",");

    showQRCode(qrCodeText);
  }

  /**
   *
   * @param {Object} obj
   */
  processConn({
    browserToken,
    clientToken,
    secret,
    serverToken,
    sharedSecret,
    sharedSecretExpanded,
    wid
  }) {
    this.connectionOpts.clientToken = clientToken;
    this.connectionOpts.serverToken = serverToken;
    this.connectionOpts.browserToken = browserToken;
    this.connectionOpts.me = wid;

    this.connectionOpts.secret = Buffer.from(secret, "base64");
    // TODO this.connectionOpts.sharedSecret
    // TODO this.connectionOpts.sharedSecretExpanded

    // TODO

    log("PROCESS CONN");
    Object.keys(this.connectionOpts).map(k =>
      log(`${k} = ${this.connectionOpts[k]}`)
    );
    log("");
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

    this.messagesQueue[messageTag] = {
      desc: "_login"
    };

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
    this.ws.on("message", data => {
      log("MESSAGE", data.slice(0, 22));
      this.handleMessage(data);
    });
  }
}

module.exports = WhatsAppService;
