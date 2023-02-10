import React from 'react';
import App from '../App';
import BoardConfigInterface, {
  Direction,
} from '../../schema/interfaces/boardConfigInterface';

type BoardKonfiguratorProps = {
  // eslint-disable-next-line react/no-unused-prop-types
  App: App;
};
type BoardKonfiguratorState = {
  config: BoardConfigInterface;
};

class BoardKonfigurator extends React.Component<
  BoardKonfiguratorProps,
  BoardKonfiguratorState
> {
  static default: BoardConfigInterface = {
    eye: { direction: Direction.NORTH, position: [0, 0] },
    height: 2,
    width: 2,
    checkPoints: [[1, 0]],
    name: 'Default Board',
    startFields: [{ direction: Direction.NORTH, position: [0, 0] }],
  };

  constructor(props: BoardKonfiguratorProps) {
    super(props);
    // eslint-disable-next-line react/no-unused-state
    this.state = { config: BoardKonfigurator.default };
  }

  render = () => {
    return (
      <div>
        <div className="dragger absolute top-0 left-0 w-[100vw] h-8" />
        <div className="grid grid-cols-4 xl:grid-cols-6 h-[100vh] bg-background">
          <div className="w-full h-full bg-accent" />
          <div className="col-span-2 xl:col-span-4" />
          <div className="w-full h-full bg-accent" />
        </div>
      </div>
    );
  };
}

export default BoardKonfigurator;
