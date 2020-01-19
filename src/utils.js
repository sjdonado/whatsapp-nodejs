const QR = require('qrcode');
const QRTerminal = require('qrcode-terminal');

const log = (...args) => {
  console.log(args.join(' ::: '));
};

const showQRCode = (txt = '') => {
  log('QR TO FILE', txt);
  QRTerminal.generate(txt);
  QR.toFile('./qr.png', txt, console.log);
};

module.exports = {
  log,
  showQRCode,
};
