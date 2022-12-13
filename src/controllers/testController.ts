import { PrismaClient } from "@prisma/client";
import { Router, Request, Response } from "express";
import { request } from "http";

const prisma = new PrismaClient();
const router = Router();

// POST /test
router.post("/", async (req: Request, res: Response) => {
  console.log(req.body);
  const test = await prisma.test.create({
    data: {
      name: req.body.name,
    },
    // name:{id:1,name:"hoge"}
  });
  res.json({ test });
});

// GET /test
router.get("/", async (req: Request, res: Response) => {
  const test = await prisma.test.findMany();
  res.json({ test });
});

// DELETE /test
router.delete("/:id", async (req: Request, res: Response) => {
  const test = await prisma.test.delete({
    where: {
      id: Number(req.params.id),
    },
  });
  res.json({ test });
});

//PUT /test
// router.put("/:id", async (req: Request, res: Response) => {
//   const test = await prisma.test.update({
//     where: {
//       id: Number(req.params.id),
//     },
//   });
//   res.json({ test });
// });
router.put("/:id", async (req: Request, res: Response) => {
  const test = await prisma.test.update({
    where: {
      id: Number(req.params.id),
    },
  });
  res.json({ test });
});
export default router;
