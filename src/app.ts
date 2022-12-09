import express from "express";
// import { PrismaClient } from "@prisma/client";
import userController from "./controllers/userController";
import testController from "./controllers/testController";
// const prisma = new PrismaClient();

const app = express();
// app.use(express.json());
// app.use("/users", userController);
// app.get("/", (req, res) => {
//   res.writeHead(200, { "Content-Type": "text/plain" });
//   res.end("hello express\n");
// });
// app.get("/users", async (req, res) => {
//   const users = await prisma.user.findMany();
//   res.json({ users });
// });
// testControllerの記述
app.use("/test", testController);

const cors = require("cors");
app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});
export default app;
