import React from 'react';
import newBGImage from './../../../assets/images/new-color.jpg';
import randomBGImage from './../../../assets/images/random-color.jpg';
import loadingBGImage from './../../../assets/images/bg-color-II.jpg';
import App from './../App';


type BoardEditorChoiceProps = {
  App: App
}
type BoardEditorChoiceState = {}

class BoardEditorChoice extends React.Component<BoardEditorChoiceProps, BoardEditorChoiceState> {
  constructor(props: BoardEditorChoiceProps) {
    super(props);
    this.handlePopupClose = this.handlePopupClose.bind(this);
  }

  handlePopupClose = () => {
    this.props.App.setState({ openPopup: false });
  };

  render() {
    return (
      <div className='absolute w-[100vw] h-[100vh] top-0 left-0'>
        <div className='w-[100vw] h-[100vh] bg-background-800/50' onClick={this.handlePopupClose}></div>
        <div>
          <div className='absolute top-[50%] left-[50%] translate-y-[-50%] translate-x-[-50%]'>
            <div className='text-center text-3xl mb-8'>Board Konfiguration</div>
            <div className='relative flex gap-8 w-[80vw] xl:w-[70vw] 2xl:w-[60vw]  mx-auto'>
              <BoardEditorChoiceCard text={'Leeres Board'} bgImage={newBGImage} />
              <BoardEditorChoiceCard text={'Zufällig'} bgImage={randomBGImage} />
              <BoardEditorChoiceCard text={'Laden'} bgImage={loadingBGImage} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

type BoardEditorChoiceCardProps = {
  text: string;
  bgImage?: string;
};

type BoardEditorChoiceCardState = {
  hover: boolean
};

class BoardEditorChoiceCard extends React.Component <BoardEditorChoiceCardProps, BoardEditorChoiceCardState> {
  constructor(props: BoardEditorChoiceCardProps) {
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
    return (
      <div
        className='relative w-[33.333%] h-[400px] xl:h-[500px] 2xl:h-[600px] shadow-2xl hover:cursor-pointer'
        onMouseEnter={this.handleHover}
        onMouseLeave={this.handleHover}
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

export default BoardEditorChoice;
