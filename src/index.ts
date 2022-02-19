import { WebSocketServer } from "ws";
import telnetlib from "telnetlib";
import Convert from "ansi-to-html";

const convert = new Convert();
const wss = new WebSocketServer({ port: 8080 }, () => "MUX Bridge connected.");

wss.on("connection", (ws) => {
  const c = telnetlib.createConnection({
    host: "bridgetown.io",
    port: 1851,
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
