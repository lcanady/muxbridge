import { WebSocketServer } from "ws";
import telnetlib from "telnetlib";
import Convert from "ansi-to-html";
import https from "https";
import { config } from "dotenv";
import { readFileSync } from "fs";

config();

const key = readFileSync(process.env.KEY || "", "utf8");
const cert = readFileSync(process.env.CERT || "", "utf8");

const convert = new Convert();

const httpsServer = https
  .createServer({ cert, key })
  .listen(2086, () =>
    console.log("MUX Bridge HTTPS Server listening on port 2086")
  );

const wss = new WebSocketServer({ server: httpsServer }, () =>
  console.log("MUX Bridge connected.")
);

wss.on("connection", (ws) => {
  const c = telnetlib.createConnection({
    host: "termv.io",
    port: 2080,
  });

  // xfer data websocket => Telnet
  ws.on("message", (data) => {
    if (c.writable) c.write(data + "\r\n");
  });

  // xfer data Telnet => Websocket
  c.on("data", (data) => {
    ws.send(convert.toHtml(data.toString()));
  });

  ws.on("close", () => c.end());
  c.on("close", () => ws.close());
});
