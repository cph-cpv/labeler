import type Pocketbase from "pocketbase";
import { createAuthenticatedClient } from "./client";
import {
  createFileAnnotationsCollection,
  createFilesCollection,
  createSampleCollection,
  virusCollection as virusCollectionSchema,
} from "./collections";
import { isMainModule } from "./utils";

async function createCollection(pb: Pocketbase, collectionConfig: any) {
  const collection = await pb.collections.create(collectionConfig);

  console.log(
    `Created collection '${collectionConfig.name}' with id '${collection.id}'`,
  );

  return collection;
}

async function deleteCollection(pb: Pocketbase, collectionName: string) {
  try {
    // Delete collection
    await pb.collections.delete(collectionName);
  } catch (error: any) {
    if (error.status !== 404) {
      throw error;
    }
  }
}

export async function resetCollections(pb: Pocketbase) {
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
}

if (isMainModule()) {
  await resetCollections(await createAuthenticatedClient());
  console.log("All collections created successfully with relations!");
}
