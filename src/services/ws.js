const WebSocket = require("ws");
const { log } = require("../utils");

class WebSocketService {
  constructor() {
    this.ws = new WebSocket("wss://web.whatsapp.com/ws", {
      headers: { Origin: "https://web.whatsapp.com" }
    });
  }

  /**
   *
   * @param {'close' | 'error' | 'open' | 'message'} ev
   */
  on(ev, fn) {
    this.ws.on(ev, (...args) => {
      log(ev.toUpperCase(), ...args);
      fn(...args);
    });
  }

  /**
   *
   * @param {any} data
   */
  send(data) {
    log("SEND", data);
    this.ws.send(data);
  }
}

module.exports = WebSocketService;
