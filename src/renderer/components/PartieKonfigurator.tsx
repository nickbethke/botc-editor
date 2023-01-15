import React from 'react';
import backgroundImage from './../../../assets/images/bg-color-III.jpg';
import App from './../App';
import { BiChevronLeft } from 'react-icons/bi';
import InputLabel from './InputLabel';

type PartieKonfiguratorProps = {
  App: App
}
type PartieKonfiguratorState = {
  name: string,
  maxRounds: number
}

class PartieKonfigurator extends React.Component<PartieKonfiguratorProps, PartieKonfiguratorState> {
  constructor(props: PartieKonfiguratorProps) {
    super(props);
    this.backToHomeScreen = this.backToHomeScreen.bind(this);
  }

  backToHomeScreen = () => {
    this.props.App.setState({ openScreen: 'home', openPopup: false });
  };

  render() {
    return (
      <div>
        <div className='dragger absolute top-0 left-0 w-[100vw] h-8' />
        <div className={'text-white grid grid-cols-3 2xl:grid-cols-2 gap-0 h-[100vh] w-[100vw]'}>
          <div style={{ backgroundImage: 'url(' + backgroundImage + ')', backgroundSize: 'cover' }}></div>
          <div className={'col-span-2 2xl:col-span-1 m-8 flex flex-col gap-8'}>
            <div className={'flex flex-row justify-start gap-8'}>
              <BiChevronLeft className={'text-4xl border border-white rounded cursor-pointer'}
                             onClick={this.backToHomeScreen} />
              <div className={'text-4xl'}>Partie Konfigurator</div>
            </div>
            <div><InputLabel editor={this} label={'Partie Name'} type={'text'} placeholder={'Partie Name'} /></div>
            <div className={'grid grid-cols-2 gap-8'}>
              <div><InputLabel editor={this} label={'Maximale Rundenanzahl'} type={'number'} /></div>
              <div><InputLabel editor={this} label={'Start Lembas'} type={'number'} /></div>
            </div>
            <div className={'grid grid-cols-2 gap-8'}>
              <div><InputLabel editor={this} label={'Schuss Lembase'} type={'number'} /></div>
              <div><InputLabel editor={this} label={'Flussbewegugsschritte'} type={'number'} /></div>
            </div>
            <div className={'grid grid-cols-2 gap-8'}>
              <div><InputLabel editor={this} label={'Runden bis zur Wiederbelebung'} type={'number'} helperText={'-1 für dauerhaften Tod'} /></div>
              <div><InputLabel editor={this} label={'TimeOut für Charakterauswahl'} type={'number'} helperText={'in ms'} /></div>
            </div>
            <div className={'grid grid-cols-2 gap-8'}>
              <div><InputLabel editor={this} label={'TimeOut für Kartenauswahl'} type={'number'} helperText={'in ms'} /></div>
              <div><InputLabel editor={this} label={'Server-Ingame-Delay'} type={'number'} helperText={'in ms'} /></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default PartieKonfigurator;
