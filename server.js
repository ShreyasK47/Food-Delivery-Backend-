const express = require("express");
const bodyParser = require("body-parser");
const cron = require("node-cron");
const WebSocket = require("ws");

const app = express();
app.use(bodyParser.json());

let menu = [];
let orders = [];
let menuIdCounter = 1;
let orderIdCounter = 1;

const categories = ["Appetizer", "Main Course", "Dessert", "Beverage"];

const wss = new WebSocket.Server({ port: 8080 });
let clients = [];

wss.on("connection", (ws) => {
  console.log("New client connected");
  clients.push(ws);

  ws.on("message", (message) => {
    console.log(`Received: ${message}`);
    ws.send(`You sent: ${message}`);
  });

  ws.on("close", () => {
    console.log("Client disconnected");
    clients = clients.filter((client) => client !== ws);
  });
});

console.log("WebSocket server is running on ws://localhost:8080");

app.post("/menu", (req, res) => {
  const { name, price, category } = req.body;

  if (!name || price === undefined || !category) {
    return res.status(400).json({ error: "Please send all the data properly." });
  }
  if (typeof price !== "number" || price <= 0) {
    return res.status(400).json({ error: "Price must be a positive number." });
  }
  if (!categories.includes(category)) {
    return res.status(400).json({ error: `Category must be one of ${categories.join(", ")}.` });
  }

  const existingItem = menu.find((item) => item.name === name);
  if (existingItem) {
    existingItem.price = price;
    existingItem.category = category;
  } else {
    menu.push({ id: menuIdCounter++, name, price, category });
  }

  res.json({ message: "Menu item added/updated successfully.", menu });
});

app.get("/menu", (req, res) => {
  res.json(menu);
});

app.post("/orders", (req, res) => {
  const { items } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Items must be a non-empty array." });
  }
  for (const itemId of items) {
    if (!menu.find((menuItem) => menuItem.id === itemId)) {
      return res.status(400).json({ error: `Menu item with ID ${itemId} not found.` });
    }
  }

  const order = {
    id: orderIdCounter++,
    items,
    status: "Preparing",
    createdAt: new Date(),
  };
  orders.push(order);

  res.json({ message: "Order placed successfully.", order });

  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: "NEW_ORDER", order }));
    }
  });
});

app.get("/orders/:id", (req, res) => {
  const orderId = parseInt(req.params.id, 10);
  const order = orders.find((order) => order.id === orderId);

  if (!order) {
    return res.status(404).json({ error: "Order not found." });
  }

  res.json(order);
});

cron.schedule("* * * * *", () => {
  orders.forEach((order) => {
    if (order.status === "Preparing") {
      order.status = "Out for Delivery";
    } else if (order.status === "Out for Delivery") {
      order.status = "Delivered";
    }

    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(
          JSON.stringify({
            type: "STATUS_UPDATE",
            order: { id: order.id, status: order.status },
          })
        );
      }
    });
  });
  console.log("Order statuses updated.");
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
