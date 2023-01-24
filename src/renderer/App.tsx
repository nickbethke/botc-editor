import React from 'react';
import './App.scss';
import BoardEditorChoice from './components/BoardEditorChoice';
import PartieEditorChoice from './components/PartieEditorChoice';
import PartieKonfigurator, { PartieConfigSchema } from './components/PartieKonfigurator';
import BoardKonfigurator from './components/BoardKonfigurator';

type AppStates = {
  openScreen: string,
  openPopup: string | false,
  toLoad: object | null
};

class App extends React.Component<unknown, AppStates> {
  constructor(props: unknown) {
    super(props);
    this.state = { openScreen: 'home', openPopup: false, toLoad: null };
    this.handleOpenBoardEditorChoice =
      this.handleOpenBoardEditorChoice.bind(this);
    this.handleOpenPartieEditorChoice =
      this.handleOpenPartieEditorChoice.bind(this);
    this.handleCloseApp = this.handleCloseApp.bind(this);
  }

  handleOpenBoardEditorChoice = () => {
    this.setState({ openPopup: 'boardEditorChoice' });
  };
  handleOpenPartieEditorChoice = () => {
    this.setState({ openPopup: 'partieEditorChoice' });
  };
  handleCloseApp = () => {
    window.electron.app.close();
  };

  render() {
    const { openScreen } = this.state;
    switch (openScreen) {
      case 'home':
        return this.homeScreen();
      case 'partieConfigNewScreen':
      case  'partieConfigLoadScreen':
        return this.partieConfigScreen();
      case 'boardConfigNewScreen':
      case 'boardConfigLoadScreen':
        return this.boardConfigScreen();
    }


  }

  homeScreen() {
    const { openPopup } = this.state;
    let popup: JSX.Element | string = '';
    if (openPopup === 'boardEditorChoice') {
      popup = (<BoardEditorChoice App={this} />);
    }
    if (openPopup === 'partieEditorChoice') {
      popup = (<PartieEditorChoice App={this} />);
    }
    return (
      <div className='text-white'>
        <div id='home' className={popup ? 'blur' : ''}>
          <div id='homeScreenBG' />
          <div className='dragger absolute top-0 left-0 w-[100vw] h-8' />
          <div className='flex flex-col py-8 px-12 justify-between h-[100vh] w-[50vw]'>
            <div>
              <div className='text-4xl 2xl:text-6xl'>Battle of the Centerländ</div>
              <div className='text-2xl 2xl:text-4xl'>Editor</div>
            </div>
            <div className='flex flex-col gap-4'>
              <div className='text-2xl clickable' onClick={this.handleOpenBoardEditorChoice}>Board-Konfigurator</div>
              <div className='text-2xl clickable' onClick={this.handleOpenPartieEditorChoice}>Partie-Konfigurator</div>
              <div className={'clickable mt-8 flex gap-4'} onClick={this.handleCloseApp}>
                <span className={'text-2xl'}>Beenden</span>
              </div>
            </div>
          </div>
        </div>
        <div id='popup'>
          {popup}
        </div>
      </div>
    );
  }

  partieConfigScreen = () => {
    const { openScreen } = this.state;
    if (openScreen === 'partieConfigNewScreen') {
      return <PartieKonfigurator App={this} />;
    }
    if (openScreen === 'partieConfigLoadScreen') {
      const load = this.state.toLoad;
      this.setState({ toLoad: null });
      return <PartieKonfigurator App={this} values={load as PartieConfigSchema} />;
    }
  };
  boardConfigScreen = () => {
    const { openScreen } = this.state;
    if (openScreen === 'boardConfigNewScreen') {
      return <BoardKonfigurator App={this} />;
    }
    if (openScreen === 'boardConfigLoadScreen') {
      return <BoardKonfigurator App={this} />;
    }
  };
}

export default App;
