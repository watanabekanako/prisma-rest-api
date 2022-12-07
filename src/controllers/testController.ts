import { PrismaClient } from "@prisma/client";
import { Router, Request, Response } from "express";

const prisma = new PrismaClient();
const router = Router();

// POST /test
router.post("/", async (req: Request, res: Response) => {
  const test = await prisma.test.create({
    data: {
      name: "hoge",
    },
  });
  res.json({ test });
});

// GET /test
router.get("/", async (req: Request, res: Response) => {
  const test = await prisma.test.findMany();
  res.json({ test });
});

// DELETE /test
router.delete("/", async (req: Request, res: Response) => {
  const test = await prisma.test.delete({
    where: {
      id: 3,
    },
  });
  res.json({ test });
});

//PUT /test
router.put("/", async (req: Request, res: Response) => {
  const test = await prisma.test.update({
    where: {
      id: 1,
    },
    data: {
      name: "伊藤",
    },
  });
});
export default router;
