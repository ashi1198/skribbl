import express from "express";
import cors from "cors";

const app = express();

app.use(cors({ origin: "*" }));  // ← add this
app.use(express.json());

app.get("/", (req, res) => {
  res.send("hello world");
});
app.get("/health", (req, res) => {
  res.send("my health is full");
});

export default app;