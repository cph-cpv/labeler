import type Pocketbase from "pocketbase";
import {
  createFileAnnotationsCollection,
  createFilesCollection,
  createSampleCollection,
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
