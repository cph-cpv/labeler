import * as dotenv from "dotenv";
import PocketBase from "pocketbase";
import {
  createFileAnnotationsCollection,
  createFilesCollection,
  createSampleCollection,
  virusCollection as virusCollectionSchema,
} from "./collections.js";

dotenv.config({ path: ".env.local" });

const adminEmail = process.env.POCKETBASE_ADMIN_EMAIL || "admin@example.com";
const adminPassword = process.env.POCKETBASE_ADMIN_PASSWORD || "password123";
const pbUrl = process.env.VITE_POCKETBASE_URL || "http://localhost:8080";

async function createCollection(pb, collectionConfig) {
  try {
    // Create collection
    const collection = await pb.collections.create(collectionConfig);

    console.log(
      `Collection '${collectionConfig.name}' created successfully:`,
      collection.id,
    );
    return collection;
  } catch (error) {
    console.error("Error creating collection:", error);
    throw error;
  }
}

async function deleteCollection(pb, collectionName) {
  try {
    // Delete collection
    await pb.collections.delete(collectionName);

    console.log(`Collection '${collectionName}' deleted successfully`);
  } catch (error) {
    // If the collection does not exist, log it and move on
    if (error.status === 404) {
      console.log(`Collection '${collectionName}' not found, skipping delete.`);
    } else {
      console.error("Error deleting collection:", error);
      throw error;
    }
  }
}

async function main() {
  const pb = new PocketBase(pbUrl);

  try {
    // Authenticate as admin once
    await pb
      .collection("_superusers")
      .authWithPassword(adminEmail, adminPassword);
    console.log("Admin authenticated successfully");

    // Delete existing collections in dependency order (dependent collections first)
    await deleteCollection(pb, "files");
    await deleteCollection(pb, "annotations");
    await deleteCollection(pb, "samples");
    await deleteCollection(pb, "viruses");

    // Create new collections
    const virusCollection = await createCollection(pb, virusCollectionSchema);
    const sampleCollection = await createCollection(
      pb,
      createSampleCollection(virusCollection.id),
    );
    const fileAnnotationCollection = await createCollection(
      pb,
      createFileAnnotationsCollection(virusCollection.id),
    );
    await createCollection(
      pb,
      createFilesCollection(fileAnnotationCollection.id, sampleCollection.id),
    );

    console.log("All collections created successfully with relations!");
  } catch (error) {
    console.error("Error in main:", error);
  }
}

main();
