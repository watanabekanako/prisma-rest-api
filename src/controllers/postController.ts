import { PrismaClient } from "@prisma/client";
import { Router, Request, Response } from "express";
import { request } from "http";

const prisma = new PrismaClient();
const router = Router();

// 必要なエンドポイント

// category
// GET / categories/;
// カテゴリ一覧
// カテゴリに紐づくブログ記事の数も必要
router.get("/categories", async (req: Request, res: Response) => {
  // prisma.categoryでcategoryテーブルに対する操作
  const categories = await prisma.category.findMany({
    // includeはrelationを取得
    include: {
      _count: {
        // _countは紐づく投稿の数
        select: {
          // postsはCategoryテーブルのposts
          posts: true,
        },
      },
    },
  });
  res.json({ categories });
});

// post

// GET /posts
// ブログ記事の一覧 コンテントは不要
router.get("/", async (req: Request, res: Response) => {
  const post = await prisma.post.findMany();
  res.json({ post });
});
// GET /posts/:id
// ブログ記事の取得(一つ)
router.get("/:id", async (req: Request, res: Response) => {
  const post = await prisma.post.findUnique({
    where: {
      id: Number(req.params.id),
    },
  });
  res.json({ post });
});
// POST /posts
// ブログ記事の作成
// サムネイルの画像はURLで指定
// ブラウザからのリクエストを受け取る:req
// ブラウザ＝フロント側
router.post("/", async (req: Request, res: Response) => {
  const post = await prisma.post.create({
    data: {
      title: req.body.title,
      description: req.body.description,
      categoryId: req.body.categoryId,
    },
  });
  res.json({ post });
});

// tags
// GET /tags/
// タグの一覧 数いらないからfindManyで
router.get("/tag", async (req: Request, res: Response) => {
  const tags = await prisma.tag.findMany();
  res.json({ tags });
});
// POST /tags/
// タグの作成

export default router;
