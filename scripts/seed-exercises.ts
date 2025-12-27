import fetch from "node-fetch";
import fs from "fs-extra";
import path from "path";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

const API_URL = "https://exercisedb.p.rapidapi.com/exercises?limit=10000"; // Get all
const HEADERS = {
  "x-rapidapi-key": process.env.RAPIDAPI_KEY || "",
  "x-rapidapi-host": "exercisedb.p.rapidapi.com",
};

const OUTPUT_DIR = path.join(process.cwd(), "public", "exercises");

async function ensureDirectory() {
  await fs.ensureDir(OUTPUT_DIR);
}

async function downloadGif(url: string, filename: string, headers: Record<string, string> = {}) {
  try {
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
    const buffer = await res.arrayBuffer();
    await fs.writeFile(filename, Buffer.from(buffer));
    return true;
  } catch (error) {
    console.warn(`Error downloading ${url}:`, error);
    return false;
  }
}

async function seedExercises() {
  if (!process.env.RAPIDAPI_KEY) {
    console.error("❌ RAPIDAPI_KEY is missing in .env");
    return;
  }

  await ensureDirectory();
  console.log("🚀 Starting Exercise Seed...");
  console.log(`📂 Output directory: ${OUTPUT_DIR}`);

  try {
    console.log("⬇️ Fetching exercises from RapidAPI...");
    const res = await fetch(API_URL, { headers: HEADERS });

    if (!res.ok) {
      throw new Error(`API Error: ${res.status} ${res.statusText}`);
    }

    const exercises = (await res.json()) as any[];
    console.log(`✅ Fetched ${exercises.length} exercises from API`);

    let processed = 0;
    let downloaded = 0;
    let skipped = 0;
    let metadataOnly = 0;

    for (const ex of exercises) {
      processed++;
      const gifFilename = `${ex.id}.gif`;
      const localGifPath = path.join(OUTPUT_DIR, gifFilename);
      let publicUrl: string | null = `/exercises/${gifFilename}`;

      // Use authenticated RapidAPI Image endpoint (try resolution param)
      const gifUrl = `https://exercisedb.p.rapidapi.com/image?id=${ex.id}&resolution=medium`;

      // 1. Download GIF if not exists
      if (!fs.existsSync(localGifPath)) {
        console.log(`[${processed}/${exercises.length}] ⬇️ Downloading GIF for: ${ex.name}`);
        // Pass HEADERS to authenticate the image download
        const success = await downloadGif(gifUrl, localGifPath, HEADERS);
        if (success) {
          downloaded++;
        } else {
          console.warn(`⚠️ Download failed for ${ex.name}. Saving metadata only.`);
          publicUrl = null;
          metadataOnly++;
        }
      } else {
        skipped++;
      }

      const bodyPartMap: Record<string, string> = {
        "waist": "abs",
        "upper legs": "piernas",
        "back": "espalda",
        "lower legs": "pantorrillas",
        "chest": "pecho",
        "upper arms": "brazos",
        "cardio": "cardio",
        "shoulders": "hombros",
        "lower arms": "antebrazos",
        "neck": "cuello"
      };

      await prisma.exercise.upsert({
        where: { id: ex.id },
        update: {
          name: ex.name,
          muscleGroup: bodyPartMap[ex.bodyPart] || ex.bodyPart,
          target: ex.target,
          equipment: ex.equipment,
          imageUrl: publicUrl,
        },
        create: {
          id: ex.id,
          name: ex.name,
          muscleGroup: bodyPartMap[ex.bodyPart] || ex.bodyPart,
          target: ex.target,
          equipment: ex.equipment,
          imageUrl: publicUrl,
        },
      });

      if (processed % 50 === 0) {
        console.log(`💾 Saved/Updated ${processed} exercises...`);
      }
    }

    console.log("✅ Seed Complete!");
    console.log(`📊 Summary: ${processed} processed, ${downloaded} downloaded, ${skipped} existing skipped, ${metadataOnly} metadata only.`);

  } catch (error) {
    console.error("❌ Fatal Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedExercises();
