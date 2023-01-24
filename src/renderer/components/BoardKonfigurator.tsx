import React from 'react';
import App from './../App';

// export type BoardConfigSchema = {}

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
