import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("Test1234!", 10);

  await prisma.user.upsert({
    where: { email: "staff@vetclinic.com" },
    update: {},
    create: {
      name: "Dr. María López",
      email: "staff@vetclinic.com",
      password,
      role: "staff",
    },
  });

  console.log("✅ Seed completed");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());