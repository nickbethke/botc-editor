import React from 'react';
import App from './../App';
import { JSONSchemaType } from 'ajv';

export const schema: JSONSchemaType<BoardConfigSchema> = {
  $ref: "#/definitions/Board",
  definitions: {
    // @ts-ignore
    Board: {
      type: "object",
      additionalProperties: false,
      properties: {
        name: {
          type: "string",
          maxLength: 32,
        },
        width: {
          type: "integer",
          minimum: 2,
        },
        height: {
          type: "integer",
          minimum: 2,
        },
        startFields: {
          type: "array",
          items: {
            $ref: "#/definitions/PositionDirection",
          },
        },
        checkPoints: {
          type: "array",
          items: {
            type: "array",
            items: {
              type: "integer",
              minimum: 0,
            },
            minItems: 2,
            maxItems: 2,
          },
          minItems: 1,
        },
        eye: {
          $ref: "#/definitions/PositionDirection",
        },
        holes: {
          type: "array",
          items: {
            type: "array",
            items: {
              type: "integer",
              minimum: 0,
            },
            minItems: 2,
            maxItems: 2,
          },
        },
        riverFields: {
          type: "array",
          items: {
            $ref: "#/definitions/PositionDirection",
          },
        },
        walls: {
          type: "array",
          items: {
            type: "array",
            items: {
              type: "array",
              items: {
                type: "integer",
                minimum: 0,
              },
              minItems: 2,
              maxItems: 2,
            },
            minItems: 2,
            maxItems: 2,
          },
        },
        lembas: {
          type: "array",
          items: {
            $ref: "#/definitions/Lembas",
          },
        },
      },
      required: [
        "checkPoints",
        "eye",
        "height",
        "holes",
        "lembas",
        "name",
        "riverFields",
        "startFields",
        "walls",
        "width",
      ],
      title: "Board",
    },
    Lembas: {
      type: "object",
      additionalProperties: false,
      properties: {
        position: {
          type: "array",
          items: {
            type: "integer",
            minimum: 0,
          },
          minItems: 2,
          maxItems: 2,
        },
        amount: {
          type: "integer",
          minimum: 0,
        },
      },
      required: ["amount", "position"],
      title: "Lembas",
    },
    PositionDirection: {
      type: "object",
      additionalProperties: false,
      properties: {
        position: {
          type: "array",
          items: {
            type: "integer",
            minimum: 0,
          },
          minItems: 2,
          maxItems: 2,
        },
        direction: {
          type: "string",
          enum: ["NORTH", "EAST", "SOUTH", "WEST"],
        },
      },
      required: ["direction", "position"],
      title: "PositionDirection",
    },
  },
};

export interface BoardConfigSchema {
  checkPoints: Array<number[]>;
  eye: PositionDirection;
  height: number;
  holes: Array<number[]>;
  lembas: Lembas[];
  name: string;
  riverFields: PositionDirection[];
  startFields: PositionDirection[];
  walls: Array<Array<number[]>>;
  width: number;
}

export interface PositionDirection {
  direction: Direction;
  position: number[];
}

export type Direction = 'NORTH' | 'EAST' | 'SOUTH' | 'WEST';

export interface Lembas {
  amount: number;
  position: number[];
}


type BoardKonfiguratorProps = {
  App: App,
}
type BoardKonfiguratorState = {}

export class BoardKonfigurator extends React.Component<BoardKonfiguratorProps, BoardKonfiguratorState> {
  //private default: BoardConfigSchema = {};
  //private notification: JSX.Element | undefined;

  constructor(props: BoardKonfiguratorProps) {
    super(props);
    this.state = {};
  }


  render = () => {
    return (
      <div>
        <div className='dragger absolute top-0 left-0 w-[100vw] h-8' />
        <div className={'grid grid-cols-4 xl:grid-cols-6 h-[100vh] bg-background'}>
          <div className={'w-full h-full bg-accent'}></div>
          <div className={'col-span-2 xl:col-span-4'}></div>
          <div className={'w-full h-full bg-accent'}></div>
        </div>
      </div>
    );
  };

}

export default BoardKonfigurator;
