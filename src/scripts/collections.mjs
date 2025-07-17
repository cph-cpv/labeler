// Collection definitions
export const virusCollection = {
  name: "viruses",
  type: "base",
  fields: [
      {
      name: "reference_id",
      type: "text",
      required: true,
    },
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "acronym",
      type: "text",
    },
    {
      name: "synonyms",
      type: "text",
    },
  ],
};

export function createFilesCollection(fileAnnotationCollectionId) {
  return {
    name: "files",
    type: "base",
    fields: [
      {
        name: "name",
        type: "text",
        required: true,
      },
      {
        name: "path",
        type: "text",
        required: true,
      },
      {
        name: "quality_rating",
        type: "select",
        maxSelect: 1,
        values: ["good", "borderline", "bad"],
      },
      {
        name: "dilution_factor",
        type: "number",
      },
      {
        name: "type",
        type: "text",
      },
      {
        name: "date",
        type: "date",

      },
      {
        name: "annotations",
        type: "relation",
        collectionId: fileAnnotationCollectionId,
        cascadeDelete: false,
        required: false,
        minSelect: 0,
        maxSelect: 1,
      },
    ],
  };
}

export function createSampleCollection(virusesCollectionId) {
  return {
    name: "samples",
    type: "base",
    fields: [
      {
        name: "name",
        type: "text",
        required: true,
      },
      {
        name: "viruses",
        type: "relation",
        required: true,
        collectionId: virusesCollectionId,
        cascadeDelete: false,
        minSelect: 0,
        maxSelect: 999,
      },
    ],
  };
}

export function createFileAnnotationsCollection(virusesCollectionId) {
  return {
    name: "annotations",
    type: "base",
    fields: [
      {
        name: "viruses",
        type: "relation",
        required: true,
        collectionId: virusesCollectionId,
        cascadeDelete: true,
        minSelect: 1,
        maxSelect: 1,
      },
      {
        name: "type",
        type: "select",
        required: true,
        maxSelect: 1,
        values: ["missing", "contamination"],
      },
    ],
  };
}
