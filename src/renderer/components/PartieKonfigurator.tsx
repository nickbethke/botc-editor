import React from 'react';
import backgroundImage from './../../../assets/images/bg-color-III.jpg';
import App from './../App';
import { BiChevronLeft } from 'react-icons/bi';
import InputLabel from './InputLabel';
import { InputValidator } from '../helper/InputValidator';
import { Notification } from './Notification';

type PartieKonfiguratorProps = {
  App: App,
  values?: PartieKonfiguratorState
}
type PartieKonfiguratorState = {
  name: string,
  maxRounds: number,
  reviveRounds: number
  serverIngameDelay: number,
  riverMoveCount: number,
  cardSelectionTimeout: number,
  charSelectionTimeout: number,
  shotLembas: number,
  startLembas: number
}

class PartieKonfigurator extends React.Component<PartieKonfiguratorProps, PartieKonfiguratorState> {
  private default = {
    name: '',
    maxRounds: 0,
    reviveRounds: 0,
    serverIngameDelay: 0,
    riverMoveCount: 0,
    cardSelectionTimeout: 0,
    charSelectionTimeout: 0,
    shotLembas: 0,
    startLembas: 0
  };
  private notification: JSX.Element = null;

  constructor(props: PartieKonfiguratorProps) {
    super(props);
    this.backToHomeScreen = this.backToHomeScreen.bind(this);
    this.handleSaveClick = this.handleSaveClick.bind(this);
    this.openLoadPartieConfig = this.openLoadPartieConfig.bind(this);
    this.setState({
      name: '',
      maxRounds: 0,
      reviveRounds: 0,
      serverIngameDelay: 0,
      riverMoveCount: 0,
      cardSelectionTimeout: 0,
      charSelectionTimeout: 0,
      shotLembas: 0,
      startLembas: 0
    });
  }

  state: PartieKonfiguratorState = this.default;

  backToHomeScreen = () => {
    this.props.App.setState({ openScreen: 'home', openPopup: false });
  };

  handleSaveClick = async () => {
    const json = JSON.stringify({ ...this.default, ...this.state }, null, 4);
    await window.electron.dialog.savePartieConfig(json);
    this.setState({ ...this.default, ...this.state });
    this.notification = (<Notification label={'Erfolgreich gespeichert'} />);
  };

  openLoadPartieConfig = async () => {
    const partieJSON = await window.electron.dialog.openPartieConfig();
    this.setState(partieJSON);
    this.notification = (<Notification label={'Erfolgreich geladen'}></Notification>);
  };

  render = () => {
    if (this.props.values) {
      this.setState(this.props.values);
      this.notification = (<Notification label={'Erfolgreich geladen'} />);
    }
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
            <div>
              {this.notification}
            </div>
            <div>
              <InputLabel
                editor={this}
                label={'Partie Name'}
                type={'text'}
                placeholder={'Partie Name'}
                value={this.state.name}
                onChange={(value) => {
                  this.setState({ name: value.toString() });
                }}
                validator={new InputValidator(InputValidator.TYPE_STRING, {
                  text: {
                    longerThan: {
                      number: 25,
                      error: 'Partie Name zu lang. Bitte nicht mehr als 25 Zeichen.'
                    },
                    regex: {
                      expression: new RegExp('^([a-z0-9A-Z_äöüÄÖÜß\\s-]*)$'),
                      error: 'Nur Buchstaben, Zahlen, Leerzeilen und Unterstriche erlaube!'
                    }
                  }
                })} />
            </div>
            <div className={'grid grid-cols-2 gap-8'}>
              <div>
                <InputLabel
                  editor={this}
                  label={'Maximale Rundenanzahl'}
                  type={'number'}
                  min={-1}
                  value={this.state.maxRounds}
                  validator={new InputValidator(InputValidator.TYPE_NUMBER, {
                    number: {
                      ifSmallerThen: {
                        number: 3,
                        error: 'Unpassende Rundenanzahl. Das Spiel wäre sehr schnell vorbei!'
                      },
                      ifBiggerThen: {
                        number: 1000,
                        error: 'Unpassende Rundenanzahl. Das Spiel würde sehr lange dauern!'
                      }
                    }
                  })}
                  onChange={(value) => {
                    this.setState({ maxRounds: Number.parseFloat(value.toString()) });
                  }}
                />
              </div>
              <div>
                <InputLabel
                  editor={this}
                  label={'Start Lembas'}
                  type={'number'}
                  value={this.state.startLembas}
                  validator={new InputValidator(InputValidator.TYPE_NUMBER, {
                    number: {
                      ifSmallerThen: {
                        number: 5,
                        error: 'Unpassende Start Lembas-Anzahl!'
                      }
                    }
                  })}
                  onChange={(value) => {
                    this.setState({ startLembas: Number.parseFloat(value.toString()) });
                  }} />
              </div>
            </div>
            <div className={'grid grid-cols-2 gap-8'}>
              <div>
                <InputLabel
                  editor={this}
                  label={'Schuss Lembase'}
                  type={'number'}
                  onChange={(value) => {
                    this.setState({ shotLembas: Number.parseFloat(value.toString()) });
                  }}
                  value={this.state.shotLembas}
                />
              </div>
              <div>
                <InputLabel
                  editor={this}
                  label={'Flussbewegugsschritte'}
                  type={'number'}
                  onChange={(value) => {
                    this.setState({ riverMoveCount: Number.parseFloat(value.toString()) });
                  }}
                  value={this.state.riverMoveCount}
                />
              </div>
            </div>
            <div className={'grid grid-cols-2 gap-8'}>
              <div>
                <InputLabel
                  editor={this}
                  label={'Runden bis zur Wiederbelebung'}
                  type={'number'}
                  helperText={'-1 für dauerhaften Tod'}
                  onChange={(value) => {
                    this.setState({ reviveRounds: Number.parseFloat(value.toString()) });
                  }}
                  value={this.state.reviveRounds}
                />
              </div>
              <div><InputLabel editor={this} label={'TimeOut für Charakterauswahl'} type={'number'}
                               helperText={'in ms'} onChange={(value) => {
                this.setState({ charSelectionTimeout: Number.parseFloat(value.toString()) });
              }} value={this.state.charSelectionTimeout} /></div>
            </div>
            <div className={'grid grid-cols-2 gap-8'}>
              <div><InputLabel editor={this} label={'TimeOut für Kartenauswahl'} type={'number'} helperText={'in ms'}
                               onChange={(value) => {
                                 this.setState({ cardSelectionTimeout: Number.parseFloat(value.toString()) });
                               }} value={this.state.cardSelectionTimeout} />
              </div>
              <div><InputLabel editor={this} label={'Server-Ingame-Delay'} type={'number'} helperText={'in ms'}
                               onChange={(value) => {
                                 this.setState({ serverIngameDelay: Number.parseFloat(value.toString()) });
                               }} value={this.state.serverIngameDelay} /></div>
            </div>
            <div className={'grid grid-cols-2 gap-8'}>
              <div>
                <button className={'border rounded p-4 w-full text-xl'} onClick={this.handleSaveClick}>Speichern
                </button>
              </div>
              <div>
                <button className={'border rounded p-4 w-full text-xl'} onClick={this.openLoadPartieConfig}>Laden
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
}

export default PartieKonfigurator;
