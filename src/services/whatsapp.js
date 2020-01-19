const WebSocketService = require("./ws");
const cryptoService = require("./crypto");
const { qrToFile } = require("../utils");

class WhatsappService {
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

    if (this.messagesQueue[tag]) {
      // when the server responds to a client's message

      const pend = this.messagesQueue[tag];

      if (pend.desc === "_login") {
        this.loginInfo.serverRef = JSON.parse(content).ref;
        this.generateQR();
      }
    } else {
      try {
        const obj = JSON.parse(content); // read the content as a JSON.

        if (obj.length) {
          switch (obj[0]) {
            case "Conn": {
              this.ping();

              const {
                ref,
                wid,
                connected,
                isResponse,
                serverToken,
                browserToken,
                clientToken,
                lc,
                lg,
                locales,
                secret
              } = obj[1];

              this.connectionOpts.clientToken = clientToken;
              this.connectionOpts.serverToken = serverToken;
              this.connectionOpts.browserToken = browserToken;
              this.connectionOpts.me = wid;

              console.log(this.connectionOpts);

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
      } catch (e) {
        // TODO
        console.log(e);
      }
    }
  }

  generateQR() {
    const { publicKey, secretKey } = cryptoService.generateKeys();
    this.loginInfo.secretKey = secretKey;
    this.loginInfo.publicKey = publicKey;

    const qrCode = `${this.loginInfo.serverRef},${this.loginInfo.publicKey},${this.loginInfo.clientId}`;

    qrToFile(qrCode);
  }

  /**
   * Initialize the communication with the API.
   *
   * 1. Generate a new Client ID (16 random bytes converted to Base64)
   * 2. Send the message `<message_id>,["admin","init",[0,4,315],["Windows","Chrome","10"],"<client_id>",true]`
   */
  init() {
    this.loginInfo.clientId = cryptoService.generateBytes().toString("base64");

    const messageTag = Date.now();

    this.messagesQueue[messageTag] = {
      desc: "_login"
    };

    this.ws.send(
      `${messageTag},["admin","init",[0,4,315],["Wilson","Chrome","10"],"${this.connectionOpts.clientId}",true]`
    );
  }

  start() {
    this.ws = new WebSocketService();

    this.ws.on("open", () => this.init());
    this.ws.on("close", () => null);
    this.ws.on("error", () => null);
    this.ws.on("message", this.handleMessage.bind(this));
  }
}

module.exports = WhatsappService;
