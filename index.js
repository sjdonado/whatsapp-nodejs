const { WhatsApp } = require("./whatsapp");
const { bytesToBase64, generateBytes, generateKeys } = require("./crypto");

const clientId = bytesToBase64(generateKeys(16));

const whatsapp = new WhatsApp(clientId);
