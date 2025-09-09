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
  ],
};

export function createFastqsCollection(samplesCollectionId: string) {
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
        name: "quality",
        type: "select",
        maxSelect: 1,
        values: ["1", "2", "3", "4", "5"],
      },
      {
        name: "dilution",
        type: "select",
        maxSelect: 1,
        values: [
          "1:1",
          "1:2",
          "1:10",
          "1:20",
          "1:25",
          "1:50",
          "1:100",
          "1:200",
        ],
      },
      {
        name: "type",
        type: "select",
        maxSelect: 1,
        values: ["dsRNA", "smRNA", "ribominus", "totRNA"],
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
        name: "extraction",
        type: "select",
        maxSelect: 1,
        values: ["manual", "presto", "kingfisher", "external"],
      },
      {
        name: "robotic_prep",
        type: "bool",
      },
    ],
  };
}

export function createSamplesCollection(virusesCollectionId: string) {
  return {
    ...ACCESS_ALL_USERS,
    name: "samples",
    type: "base",
    fields: [
      {
        name: "name",
        type: "text",
        required: true,
        unique: true,
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
    indexes: ["CREATE UNIQUE INDEX idx_name ON samples (name)"],
  };
}

export function createExceptionsCollection(
  fastqsCollectionId: string,
  virusesCollectionId: string,
) {
  return {
    ...ACCESS_ALL_USERS,
    name: "exceptions",
    type: "base",
    fields: [
      {
        name: "fastq",
        type: "relation",
        required: true,
        collectionId: fastqsCollectionId,
        cascadeDelete: true,
        minSelect: 1,
        maxSelect: 1,
      },
      {
        name: "virus",
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
        values: ["Missing", "Contamination"],
      },
    ],
  };
}
