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
    skip: (selectedPage - 1) * selectedPerPage,
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
  const tags = req.body.tags;
  // 新規追加するタグ
  const newTags = tags?.filter((tag: any) => !tag.id) ?? [];
  // 既存のタグ
  const existTags = tags?.filter((tag: any) => tag.id) ?? [];

  let newTagRecs = [];
  // 新規追加するタグがあるならTagテーブルに追加
  if (newTags.length) {
    newTagRecs = await Promise.all(
      newTags.map((tag: any) => {
        return prisma.tag.create({
          data: tag,
        });
      })
    );
  }

  // 投稿の作成
  const post = await prisma.post.create({
    data: {
      title: req.body.title,
      content: req.body.content,
      categoryId: req.body.categoryId,
    },
  });

  // タグの紐付け
  const insertTagData = [
    ...newTagRecs.map((r) => ({
      postId: post.id,
      tagId: r.id,
    })),
    ...existTags.map((r: any) => ({
      postId: post.id,
      tagId: r.id,
    })),
  ];
  if (insertTagData.length > 0) {
    await prisma.tagsOnPosts.createMany({
      data: insertTagData,
    });
  }
  res.json({ post });
});

router.delete("/:id", async (req: Request, res: Response) => {
  const post = await prisma.post.findUnique({
    where: {
      id: Number(req.params.id),
    },
  });
  console.log("id: ", req.params.id);
  if (!post) {
    throw new Error("");
  }
  await prisma.post.delete({
    where: {
      id: Number(req.params.id),
    },
  });
  res.json({ post });
});

//PUT /posts
// ブログ記事更新
router.put("/:id", async (req: Request, res: Response) => {
  const tags = req.body.tags;
  // 新規追加するタグ
  const newTags = tags?.filter((tag: any) => !tag.id) ?? [];
  // 既存のタグ
  const existTags = tags?.filter((tag: any) => tag.id) ?? [];

  let newTagRecs = [];
  // 新規追加するタグがあるならTagテーブルに追加
  if (newTags.length) {
    newTagRecs = await Promise.all(
      newTags.map((tag: any) => {
        return prisma.tag.create({
          data: tag,
        });
      })
    );
  }

  // postテーブルの更新
  const post = await prisma.post.update({
    where: {
      id: Number(req.params.id),
    },
    data: {
      id: Number(req.params.id),
      title: req.body.title,
      description: req.body.description,
      categoryId: req.body.categoryId,
      content: req.body.content,
    },
  });

  // タグの紐付け
  const insertTagData = [
    ...newTagRecs.map((r) => ({
      postId: post.id,
      tagId: r.id,
    })),
    ...existTags.map((r: any) => ({
      postId: post.id,
      tagId: r.id,
    })),
  ];
  // 指定した投稿とタグの紐付けを一旦全て削除
  await prisma.tagsOnPosts.deleteMany({
    where: {
      postId: Number(req.params.id),
    },
  });
  // 追加したいタグがあれば紐付ける
  if (insertTagData.length > 0) {
    await prisma.tagsOnPosts.createMany({
      data: insertTagData,
    });
  }

  res.json({ post });
});

// post /categories
router.post("/categories", async (req: Request, res: Response) => {
  // 投稿の作成
  console.log("req", req);
  const categories = await prisma.category.create({
    data: {
      name: req.body.name,
    },
  });

  res.json({ categories });
});

export default router;
