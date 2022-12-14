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

//  GET タグ一覧;
router.get("/tags", async (req: Request, res: Response) => {
  // prisma.categoryでcategoryテーブルに対する操作
  const tags = await prisma.tag.findMany({
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
  res.json({ tags });
});

// GET /posts
// ブログ記事の一覧 コンテントは不要

router.get("/", async (req: Request, res: Response) => {
  const {
    // 今のページ数
    page,
    // ページごとの表示件数
    perPage,
  } = req.query;

  // if (req.query.tagId) {
  //   const relations = await prisma.tagsOnPosts.findMany({
  //     where: {
  //       tagId: req.query.tagId ? Number(req.query.tagId) : undefined,
  //     },
  //   });
  // }

  // const postIds = relations.map((row) => row.postId);
  const selectedPerPage = perPage ? Number(perPage) : 10;
  const selectedPage = page ? Number(page) : 1;
  const posts = await prisma.post.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      category: true,

      tags: {
        include: {
          tag: true,
        },
      },
    },
    where: {
      categoryId: req.query.category ? Number(req.query.category) : undefined,
      // tagId: {
      //   in: req.query.tag
      //     ? req.query.tag.split(",").map((v) => Number(v))
      //     : undefined,
      // },
      // id: {
      //   in: postIds,
      // },
    },

    take: selectedPerPage,
    skip: (selectedPage - 1) * Number(perPage),
  });
  // aggregateは集計条件に合致する条件の抽出が可能
  const count = await prisma.post.aggregate({
    _count: true,
    where: {
      categoryId: req.query.category ? Number(req.query.category) : undefined,
    },
  });
  res.json({
    post: posts.map((post) => ({
      // タグ以外はそのまま返す
      ...post,
      // タグは入れ子になっているので`tag: [{id: 1, name: "hoge"}]`の形になるように変換
      tags: post.tags.map((tag) => ({
        ...tag.tag,
      })),
    })),
    // 全部で何件あるのか
    totalCount: count._count,
    // // perPageがあればNumber型に直して指定、無ければデフォルトの件数(10件)を指定
    pages: Math.ceil(count._count / (perPage ? Number(perPage) : 10)),
  });
});

// GET /posts/:id
// ブログ記事の取得(一つ)
router.get("/:id", async (req: Request, res: Response) => {
  const post = await prisma.post.findUnique({
    where: {
      id: Number(req.params.id),
    },
    // relationのときはinclude使用して取得

    include: {
      category: true,
    },
  });
  const tags = await prisma.tagsOnPosts.findMany({
    where: {
      postId: Number(req.params.id),
    },
    select: {
      tag: {
        select: {
          name: true,
          id: true,
        },
      },
    },
  });
  // : tags.map((v) => v.tag)
  res.json({ post: { ...post, tags: tags.map((v) => v.tag) } });
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
router.delete("/:id", async (req: Request, res: Response) => {
  const post = await prisma.post.findUnique({
    where: {
      id: Number(req.params.id),
    },
  });
  res.json({ post });
});
export default router;
