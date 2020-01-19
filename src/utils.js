const qr = require("qrcode");

const log = (...args) => {
  console.log(args.join(" ::: "));
};

const qrToFile = (txt = "") => {
  qr.toFile("./qr.png", txt, console.log);
};

module.exports = {
  log,
  qrToFile
};
