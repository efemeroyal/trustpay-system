const WebSocket = require("ws");

const clients = new Set();

const broadcast = (type, payload) => {
  const message = JSON.stringify({ type, payload });
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
};

const setupWebsocket = (server) => {
  const wss = new WebSocket.Server({ server });

  wss.on("connection", (socket) => {
    clients.add(socket);
    console.log("WebSocket client connected");

    socket.on("close", () => {
      clients.delete(socket);
      console.log("WebSocket client disconnected");
    });

    socket.on("error", (error) => {
      console.error("WebSocket error:", error);
    });

    if (socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({ type: "ping", payload: { message: "connected" } }),
      );
    }
  });

  wss.on("error", (err) => {
    console.error("WebSocket server error:", err);
  });

  console.log("WebSocket server attached to HTTP server");
};

module.exports = { broadcast, setupWebsocket };
