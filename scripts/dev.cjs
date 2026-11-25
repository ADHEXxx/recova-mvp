const { createSocket } = require("node:dgram");
const QRCode = require("qrcode");

function defaultNetworkAddress() {
  return new Promise((resolve, reject) => {
    const socket = createSocket("udp4");
    socket.once("error", (error) => {
      socket.close();
      reject(error);
    });
    // Select the default network interface without sending a packet.
    socket.connect(80, "192.0.2.1", () => {
      const { address } = socket.address();
      socket.close();
      resolve(address);
    });
  });
}

async function main() {
  const args = process.argv.slice(2);
  if (!args.some((arg) => ["--help", "-h"].includes(arg))) {
    try {
      const options = args.join(" ");
      const port = options.match(/(?:^|\s)(?:--port|-p)(?:=|\s+)(\d+)/)?.[1] ?? process.env.PORT ?? "3000";
      const hostname = options.match(/(?:^|\s)(?:--hostname|-H)(?:=|\s+)(\S+)/)?.[1];
      if (!hostname || hostname === "0.0.0.0" || hostname === "::") {
        const address = await defaultNetworkAddress();
        const protocol = args.includes("--experimental-https") ? "https" : "http";
        const url = `${protocol}://${address}:${port}`;
        const qr = await QRCode.toString(url, { type: "terminal", small: true });
        console.log(`\nEscaneá para abrir Recova desde la misma red Wi-Fi: ${url}\n${qr}`);
      }
    } catch (error) {
      console.warn(`No se pudo mostrar el QR de red: ${error.message}`);
    }
  }

  const nextCli = require.resolve("next/dist/bin/next");
  process.argv.splice(1, 1, nextCli, "dev");
  require(nextCli);
}

main();
