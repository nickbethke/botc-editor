import React from 'react';
import backgroundImage from './../../../assets/images/bg-color-III.jpg';
import App from './../App';
import { BiChevronLeft } from 'react-icons/bi';
import InputLabel from './InputLabel';
import { InputValidator } from '../helper/InputValidator';
import { Error, Notification } from './Notification';
import { ConfirmPopup } from './ConfirmPopup';

export type PartieConfigSchema = {
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

type PartieKonfiguratorProps = {
  App: App,
  values?: PartieConfigSchema
}
type PartieKonfiguratorState = {
  values: PartieConfigSchema,
  popupLeave: boolean
}

export class PartieKonfigurator extends React.Component<PartieKonfiguratorProps, PartieKonfiguratorState> {
  private default: PartieConfigSchema = {
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
  private notification: JSX.Element | undefined;

  constructor(props: PartieKonfiguratorProps) {
    super(props);
    this.handleBackButton = this.handleBackButton.bind(this);
    this.handleSaveClick = this.handleSaveClick.bind(this);
    this.openLoadPartieConfig = this.openLoadPartieConfig.bind(this);
    this.abortBackToHomeScreen = this.abortBackToHomeScreen.bind(this);
    this.state = {
      values: this.default,
      popupLeave: false
    };
  }

  handleBackButton = () => {
    this.setState({ popupLeave: true });
  };

  backToHomeScreen = () => {
    this.props.App.setState({ openScreen: 'home', openPopup: false });
  };
  abortBackToHomeScreen = () => {
    this.setState({ popupLeave: false });
  };

  handleSaveClick = async () => {
    const json = JSON.stringify({ ...this.default, ...this.state.values }, null, 4);
    const answer = await window.electron.dialog.savePartieConfig(json);
    if (answer)
      this.notification = <Notification label={'Erfolgreich gespeichert'} />;
    this.setState({ values: { ...this.default, ...this.state.values } });

  };

  openLoadPartieConfig = async () => {
    const partieJSON = await window.electron.dialog.openPartieConfig();
    if (partieJSON) {
      this.setState({ values: partieJSON });
      this.notification = (<Notification label={'Erfolgreich geladen'}></Notification>);
    } else {
      this.setState({ values: this.default });
      this.notification = (<Error label={'Laden der Datei fehlgeschlagen!'}></Error>);
    }
  };

  render = () => {
    if (this.props.values) {
      this.setState({ values: this.props.values });
      this.notification = (<Notification label={'Erfolgreich geladen'} />);
    }
    let popupLeave = null;
    if (this.state.popupLeave) {
      popupLeave = (
        <ConfirmPopup label={'Partie-Konfigurator wirklich verlassen?'} onConfirm={this.backToHomeScreen}
                      onAbort={this.abortBackToHomeScreen} />);
    }
    const { values } = this.state;
    return (
      <div>
        <div className='dragger absolute top-0 left-0 w-[100vw] h-8' />
        <div className={'text-white grid grid-cols-3 2xl:grid-cols-2 gap-0 h-[100vh] w-[100vw]'}>
          <div style={{ backgroundImage: 'url(' + backgroundImage + ')', backgroundSize: 'cover' }}></div>
          <div className={'col-span-2 2xl:col-span-1 m-8 flex flex-col gap-8'}>
            <div className={'flex flex-row justify-start gap-8'}>
              <BiChevronLeft className={'text-4xl border border-white cursor-pointer hover:bg-accent-500'}
                             onClick={this.handleBackButton} />
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
                value={values.name}
                onChange={(value) => {
                  this.setState({ values: { ...values, name: value.toString() } });
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
                  value={values.maxRounds}
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
                    this.setState({ values: { ...values, maxRounds: Number.parseFloat(value.toString()) } });
                  }}
                />
              </div>
              <div>
                <InputLabel
                  editor={this}
                  label={'Start Lembas'}
                  type={'number'}
                  value={values.startLembas}
                  validator={new InputValidator(InputValidator.TYPE_NUMBER, {
                    number: {
                      ifSmallerThen: {
                        number: 5,
                        error: 'Unpassende Start Lembas-Anzahl!'
                      }
                    }
                  })}
                  onChange={(value) => {
                    this.setState({
                      values: {
                        ...values,
                        startLembas: Number.parseFloat(value.toString())
                      }
                    });
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
                    this.setState({
                      values: {
                        ...values,
                        shotLembas: Number.parseFloat(value.toString())
                      }
                    });
                  }}
                  value={values.shotLembas}
                />
              </div>
              <div>
                <InputLabel
                  editor={this}
                  label={'Flussbewegugsschritte'}
                  type={'number'}
                  onChange={(value) => {
                    this.setState({
                      values: {
                        ...values,
                        riverMoveCount: Number.parseFloat(value.toString())
                      }
                    });
                  }}
                  value={values.riverMoveCount}
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
                    this.setState({
                      values: {
                        ...values,
                        reviveRounds: Number.parseFloat(value.toString())
                      }
                    });
                  }}
                  value={values.reviveRounds}
                />
              </div>
              <div>
                <InputLabel
                  editor={this}
                  label={'TimeOut für Charakterauswahl'}
                  type={'number'}
                  helperText={'in ms'}
                  onChange={(value) => {
                    this.setState({
                      values: {
                        ...values,
                        charSelectionTimeout: Number.parseFloat(value.toString())
                      }
                    });
                  }}
                  value={values.charSelectionTimeout} /></div>
            </div>
            <div className={'grid grid-cols-2 gap-8'}>
              <div>
                <InputLabel
                  editor={this}
                  label={'TimeOut für Kartenauswahl'}
                  type={'number'}
                  helperText={'in ms'}
                  onChange={(value) => {
                    this.setState({
                      values: {
                        ...values,
                        cardSelectionTimeout: Number.parseFloat(value.toString())
                      }
                    });
                  }}
                  value={values.cardSelectionTimeout} />
              </div>
              <div>
                <InputLabel
                  editor={this}
                  label={'Server-Ingame-Delay'}
                  type={'number'}
                  helperText={'in ms'}
                  onChange={(value) => {
                    this.setState({
                      values: {
                        ...values,
                        serverIngameDelay: Number.parseFloat(value.toString())
                      }
                    });
                  }}
                  value={values.serverIngameDelay} /></div>
            </div>
            <div className={'grid grid-cols-2 gap-8'}>
              <div>
                <button className={'w-full border border-white p-4 hover:bg-accent-500 text-lg'}
                        onClick={this.handleSaveClick}>Speichern
                </button>
              </div>
              <div>
                <button className={'w-full border border-white p-4 hover:bg-accent-500 text-lg'}
                        onClick={this.openLoadPartieConfig}>Laden
                </button>
              </div>
            </div>
          </div>
        </div>
        {popupLeave}
      </div>
    );
  }
  ;
}

export default PartieKonfigurator;
