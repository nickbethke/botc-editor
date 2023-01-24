import React from 'react';
import newBGImage from './../../../assets/images/new-color.jpg';
import loadingBGImage from './../../../assets/images/bg-color-II.jpg';
import App from './../App';


type PartieEditorChoiceProps = {
  App: App
}
type PartieEditorChoiceState = {}

class PartieEditorChoice extends React.Component<PartieEditorChoiceProps, PartieEditorChoiceState> {
  constructor(props: PartieEditorChoiceProps) {
    super(props);
    this.handlePopupClose = this.handlePopupClose.bind(this);
    this.openLoadPartieConfig = this.openLoadPartieConfig.bind(this);
  }

  handlePopupClose = () => {
    this.props.App.setState({ openPopup: false });
  };

  openNewConfigScreen = () => {
    this.props.App.setState({ openScreen: 'partieConfigNewScreen' });
  };
  openLoadPartieConfig = async () => {
    const partieJSON = await window.electron.dialog.openPartieConfig();
    if (partieJSON) {
      this.props.App.setState({ openScreen: 'partieConfigLoadScreen', toLoad: partieJSON });
    }
  };

  render() {
    return (
      <div className='absolute w-[100vw] h-[100vh] top-0 left-0'>
        <div className='w-[100vw] h-[100vh] bg-background-800/50' onClick={this.handlePopupClose}></div>
        <div>
          <div className='absolute top-[50%] left-[50%] translate-y-[-50%] translate-x-[-50%]'>
            <div className='text-center text-3xl mb-8'>Partie Konfiguration</div>
            <div className='relative flex gap-8 w-[80vw] xl:w-[70vw] 2xl:w-[60vw]  mx-auto'>
              <PartieEditorChoiceCard text={'Neue Partie Konfiguration'} bgImage={newBGImage}
                                      onClickAction={this.openNewConfigScreen} />
              <PartieEditorChoiceCard text={'Laden'} bgImage={loadingBGImage}
                                      onClickAction={this.openLoadPartieConfig} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

type PartieEditorChoiceCardProps = {
  text: string;
  bgImage?: string;
  onClickAction?: Function
};

type PartieEditorChoiceCardState = {
  hover: boolean
};

class PartieEditorChoiceCard extends React.Component<PartieEditorChoiceCardProps, PartieEditorChoiceCardState> {
  constructor(props: PartieEditorChoiceCardProps) {
    super(props);
    this.state = { hover: false };
    this.handleHover = this.handleHover.bind(this);
  }

  handleHover = () => {
    this.setState({ hover: !this.state.hover });
  };

  render() {
    const { text, bgImage } = this.props;
    const { hover } = this.state || { hover: false };
    const onclick = this.props.onClickAction?.bind(this);
    return (
      <div
        className='relative w-[50%] h-[400px] xl:h-[500px] 2xl:h-[600px] shadow-2xl hover:cursor-pointer'
        onMouseEnter={this.handleHover}
        onMouseLeave={this.handleHover}
        onClick={this.props.onClickAction && onclick}
      >
        <div className='absolute top-0 left-0 h-full w-full z-0'>
          <div style={{
            backgroundImage: 'url("' + bgImage + '")',
            backgroundPosition: 'center',
            backgroundSize: 'cover'
          }}
               className='absolute top-0 left-0 w-full h-full'>
          </div>
          <div
            className={'transition-all absolute top-0 left-0 w-full h-full' + (hover ? ' bg-background-800/0' : ' bg-background-800/50')}></div>
        </div>
        <div className='z-20 absolute top-0 left-0 h-full w-full'>
          <div
            className={'transition-all absolute bottom-0 text-center w-full text-xl' + (hover ? ' bg-accent-500 p-8' : ' bg-background-800/50 p-4')}>{text}</div>
        </div>
      </div>
    );
  }
}

export default PartieEditorChoice;
