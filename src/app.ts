import express from "express";
// import { PrismaClient } from "@prisma/client";
import userController from "./controllers/userController";
import testController from "./controllers/userController";
// const prisma = new PrismaClient();
const app = express();
app.use(express.json());
app.use("/users", userController);
app.get("/", (req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("hello express\n");
});
// app.get("/users", async (req, res) => {
//   const users = await prisma.user.findMany();
//   res.json({ users });
// });
// testControllerの記述
app.use("test", testController);
export default app;
