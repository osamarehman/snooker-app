import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Update all matches where initialPrice is null
  await prisma.match.updateMany({
    where: {
      initialPrice: null
    },
    data: {
      initialPrice: 0
    }
  })
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 