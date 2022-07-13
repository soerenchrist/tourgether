const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const peaks = require("./peaks");

const load = async () => {
  try { 
    const currentPeaks = await prisma.peak.count();
    if (currentPeaks > 0) {
      console.log(`There are already ${currentPeaks} peaks in the db. Doing nothing...`)
      return;
    }

    const result = await prisma.peak.createMany({
      data: peaks
    });
    console.log(`Inserted ${result.count} peaks into db`);
    console.log("Database seed finished")
  } catch(e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

load();