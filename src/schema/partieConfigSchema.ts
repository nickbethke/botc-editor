import { JSONSchemaType } from 'ajv';

// @ts-ignore
export const schema: JSONSchemaType<PartieConfigSchema> = {
  "$ref": "#/definitions/Partie",
  "definitions": {
    "Partie": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "startLembas": {
          "type": "integer",
          "minimum": 0,
          "maximum": 99
        },
        "shotLembas": {
          "type": "integer",
          "minimum": -1,
          "maximum": 99
        },
        "characterSelectionTimeout": {
          "type": "integer",
          "minimum": 1,
          "maximum": 36000000,
          "multipleOf": 1000
        },
        "cardSelectionTimeout": {
          "type": "integer",
          "minimum": 1,
          "maximum": 36000000,
          "multipleOf": 1000
        },
        "riverMoveCount": {
          "type": "integer",
          "minimum": 1,
          "maximum": 99
        },
        "serverIngameDelay": {
          "type": "integer",
          "minimum": 1,
          "maximum": 60000,
          "multipleOf": 100
        },
        "reviveRounds": {
          "type": "integer",
          "minimum": -1,
          "maximum": 99
        },
        "maxRounds": {
          "type": "integer",
          "minimum": 1,
          "maximum": 99
        }
      },
      "required": [
        "cardSelectionTimeout",
        "characterSelectionTimeout",
        "maxRounds",
        "reviveRounds",
        "riverMoveCount",
        "serverIngameDelay",
        "shotLembas",
        "startLembas"
      ],
      "title": "Partie"
    }
  }
};

export interface PartieConfigSchema {
  cardSelectionTimeout: number;
  characterSelectionTimeout: number;
  maxRounds: number;
  reviveRounds: number;
  riverMoveCount: number;
  serverIngameDelay: number;
  shotLembas: number;
  startLembas: number;
}
