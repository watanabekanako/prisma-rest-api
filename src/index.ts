// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

// async function main() {
//   const allUsers = await prisma.user.findMany();
//   console.log(allUsers);
// }

// main()
//   .catch((e) => {
//     throw e;
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
import app from "./app";
import { PrismaClient } from "@prisma/client";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`REST API server ready at: http://localhost:${PORT}`);
});
