import PocketBase from "pocketbase";
import {
  virusCollection as virusCollectionSchema,
  createSampleCollection,
  createFileAnnotationsCollection,
  createFilesCollection,
} from "./collections.mjs";

// Basic script to create a PocketBase collection using the JS SDK
// Usage: node create_collection.mjs [collection_name] [admin_email] [admin_password]

const adminEmail = process.argv[2] || "admin@example.com";
const adminPassword = process.argv[3] || "password123";
const pbUrl = process.argv[4] || "http://localhost";

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
    await pb.admins.authWithPassword(adminEmail, adminPassword);
    console.log("Admin authenticated successfully");

    // Delete existing collections
    await deleteCollection(pb, "samples");
    await deleteCollection(pb, "files");
    await deleteCollection(pb, "annotations");
    await deleteCollection(pb, "viruses");

    // Create new collections
    const virusCollection = await createCollection(pb, virusCollectionSchema);
    const fileAnnotationCollection = await createCollection(
      pb,
      createFileAnnotationsCollection(virusCollection.id),
    );
    await createCollection(
      pb,
      createFilesCollection(fileAnnotationCollection.id),
    );
    await createCollection(pb, createSampleCollection(virusCollection.id));

    console.log("All collections created successfully with relations!");
  } catch (error) {
    console.error("Error in main:", error);
  }
}

main();
