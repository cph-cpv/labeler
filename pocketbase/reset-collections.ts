import type Pocketbase from "pocketbase";
import {
  createExceptionsCollection,
  createFastqsCollection,
  createSamplesCollection,
  virusCollection as virusCollectionSchema,
} from "./collections";

async function createCollection(pb: Pocketbase, collectionConfig: any) {
  const collection = await pb.collections.create(collectionConfig);

  console.log(
    `✅ Created collection '${collectionConfig.name}' with id '${collection.id}'`,
  );

  return collection;
}

async function deleteCollection(pb: Pocketbase, collectionName: string) {
  try {
    // Then delete the collection itself
    await pb.collections.delete(collectionName);
  } catch (error: any) {
    if (error.status !== 404) {
      throw error;
    }
  }
}

export async function resetCollections(pb: Pocketbase) {
  // Delete in reverse dependency order
  await deleteCollection(pb, "exceptions");
  await deleteCollection(pb, "fastqs");
  await deleteCollection(pb, "samples");
  await deleteCollection(pb, "viruses");

  const virusCollection = await createCollection(pb, virusCollectionSchema);

  const sampleCollection = await createCollection(
    pb,
    createSamplesCollection(virusCollection.id),
  );

  const fastqsCollection = await createCollection(
    pb,
    createFastqsCollection(sampleCollection.id),
  );

  await createCollection(
    pb,
    createExceptionsCollection(fastqsCollection.id, virusCollection.id),
  );
}
