import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    // Update all matches where initialPrice is null
    const result = await prisma.match.updateMany({
      where: {
        initialPrice: {
          equals: null
        }
      },
      data: {
        initialPrice: 0
      }
    })
    
    console.log(`Updated ${result.count} matches`)
  } catch (error) {
    console.error('Error updating matches:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main() 