import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const posts: any = [];

for (let i = 0; i < 100; i++) {
  posts.push({ title: `title ${i + 1}` });
}

async function main() {
  // タグの作成
  const [tag1, tag2, tag3] = await Promise.all([
    prisma.tag.create({
      data: {
        name: "tag1",
      },
    }),
    prisma.tag.create({
      data: {
        name: "tag2",
      },
    }),
    prisma.tag.create({
      data: {
        name: "tag3",
      },
    }),
  ]);

  // カテゴリの作成
  const [category1, category2, category3] = await Promise.all([
    prisma.category.create({
      data: {
        name: "category1",
      },
    }),
    prisma.category.create({
      data: {
        name: "category2",
      },
    }),
    prisma.category.create({
      data: {
        name: "category3",
      },
    }),
  ]);

  // ユーザーの作成
  const [user1, user2, user3] = await Promise.all([
    prisma.user.create({
      data: {
        name: "user1",
        email: "user1@example.com",
      },
    }),
    prisma.user.create({
      data: {
        name: "user2",
        email: "user2@example.com",
      },
    }),
    prisma.user.create({
      data: {
        name: "user3",
        email: "user3@example.com",
      },
    }),
  ]);

  // postの作成
  const [post1, post2, post3, post4, post5, post6] = await Promise.all([
    prisma.post.create({
      data: {
        title: "post1",
        content: "post1 content",
        description: "post1 description",
        published: true,
        authorId: user1.id,
        categoryId: category1.id,
      },
    }),
    prisma.post.create({
      data: {
        title: "post2",
        content: "post2 content",
        description: "post2 description",
        published: false,
        authorId: user2.id,
        categoryId: category2.id,
      },
    }),
    // 必須項目だけのやつ
    prisma.post.create({
      data: {
        title: "post3",
        categoryId: category2.id,
      },
    }),
    prisma.post.create({
      data: {
        title: "post4",
        content: "post4 content",
        description: "post4 description",
        published: true,
        authorId: user2.id,
        categoryId: category2.id,
      },
    }),
    prisma.post.create({
      data: {
        title: "post5",
        content: "post5 content",
        description: "post5 description",
        published: true,
        authorId: user1.id,
        categoryId: category2.id,
      },
    }),
    prisma.post.create({
      data: {
        title: "post6",
        content: "post6 content",
        description: "post6 description",
        published: true,
        authorId: user2.id,
        categoryId: category2.id,
      },
    }),
  ]);

  await prisma.tagsOnPosts.createMany({
    data: [
      { postId: post1.id, tagId: tag1.id },
      { postId: post1.id, tagId: tag2.id },
      { postId: post2.id, tagId: tag2.id },
      { postId: post4.id, tagId: tag1.id },
      { postId: post5.id, tagId: tag2.id },
    ],
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
