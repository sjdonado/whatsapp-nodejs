const { EventEmitter } = require("events");
const WebSocket = require("ws");
const { log } = require("./utils");

const PING = "?,,";

/**
 *
 */
class WhatsApp extends EventEmitter {
  constructor(clientId) {
    super();

    this.ws = new WebSocket("wss://web.whatsapp.com/ws", {
      headers: { Origin: "https://web.whatsapp.com" }
    });

    this.ws.on("open", () => {
      log("OPEN");
      this.send(
        `${Date.now()},["admin","init",[0,4,315],["Windows","Chrome","10"],"${clientId}",true]`
      );
      this.makePing();
    });

    this.ws.on(
      "message",
      data => log("MESSAGE", data) && this.emit("message", data)
    );

    this.ws.on("close", () => log("CLOSE"));
    this.ws.on("ping", () => log("PING"));
    this.ws.on("pong", () => log("PONG"));
    this.ws.on("unexpected-response", () => log("UNEXPECTED RESPONSE"));
    this.ws.on("upgrade", () => log("UPGRADE"));
  }

  send(data) {
    log("SENDING", data) && this.ws.send(data);
  }

  makePing() {
    setTimeout(() => this.send(PING) && this.makePing(), 10000);
  }
}

module.exports = {
  WhatsApp
};
