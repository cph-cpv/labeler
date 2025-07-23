// Collection definitions
const ACCESS_ALL_USERS = {
  createRule: "@request.auth.id != ''",
  updateRule: "@request.auth.id != ''",
  listRule: "@request.auth.id != ''",
  deleteRule: "@request.auth.id != ''",
  viewRule: "@request.auth.id != ''",
};

export const virusCollection = {
  ...ACCESS_ALL_USERS,
  name: "viruses",
  type: "base",
  fields: [
    {
      name: "uuid",
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
    {
      name: "type",
      type: "select",
      maxSelect: 1,
      values: ["Satellite", "Virus", "Viroid"],
    },
  ],
};

export function createFastqsCollection(
  fastqAnnotationCollectionId: string,
  samplesCollectionId: string,
) {
  return {
    ...ACCESS_ALL_USERS,
    name: "fastqs",
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
        type: "number",
        min: 1,
        max: 5,
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
        name: "excluded",
        type: "bool",
      },
      {
        name: "sample",
        type: "relation",
        collectionId: samplesCollectionId,
        cascadeDelete: false,
        required: false,
        minSelect: 0,
        maxSelect: 1,
      },
      {
        name: "annotations",
        type: "relation",
        collectionId: fastqAnnotationCollectionId,
        cascadeDelete: false,
        required: false,
        minSelect: 0,
        maxSelect: 1,
      },
    ],
  };
}

export function createSampleCollection(virusesCollectionId: string) {
  return {
    ...ACCESS_ALL_USERS,
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
        collectionId: virusesCollectionId,
        cascadeDelete: false,
        minSelect: 0,
        maxSelect: 999,
      },
    ],
  };
}

export function createFastqAnnotationsCollection(virusesCollectionId: string) {
  return {
    ...ACCESS_ALL_USERS,
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
