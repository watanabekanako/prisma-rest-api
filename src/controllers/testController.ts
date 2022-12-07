import { PrismaClient } from "@prisma/client";
import { Router, Request, Response } from "express";

const prisma = new PrismaClient();
const router = Router();

// POST /test
router.post("/", async (req: Request, res: Response) => {
  const test = await prisma.test.findMany();
  res.json({ test });
});

export default router;
