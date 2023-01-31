import React, { ReactElement } from 'react';
import { BiChevronLeft } from 'react-icons/bi';
import { AiFillFolderOpen } from 'react-icons/ai';
import MonacoEditor, { monaco } from 'react-monaco-editor';
import { HiSaveAs } from 'react-icons/hi';
import Mousetrap from 'mousetrap';
import { ConfirmPopup } from './ConfirmPopup';
import KeyCode = monaco.KeyCode;
import KeyMod = monaco.KeyMod;

type JSONValidatorProps = {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  App: App;
};
type JSONValidatorState = {
  popupLeave: boolean;
  code: string;
  codeError: string;
  type: 'board' | 'partie';
};

class JSONValidator extends React.Component<
  JSONValidatorProps,
  JSONValidatorState
> {
  constructor(props: JSONValidatorProps) {
    super(props);
    this.handleBackButton = this.handleBackButton.bind(this);
    this.backToHomeScreen = this.backToHomeScreen.bind(this);
    this.abortBackToHomeScreen = this.abortBackToHomeScreen.bind(this);
    this.openFile = this.openFile.bind(this);
    this.saveFile = this.saveFile.bind(this);
    this.changeType = this.changeType.bind(this);

    this.state = {
      code: JSON.stringify({}, null, 4),
      codeError: '',
      popupLeave: false,
      type: 'partie',
    };
    Mousetrap.bind(['command+s', 'ctrl+s'], () => {
      this.saveFile().catch(console.log);
    });
    monaco.editor.addEditorAction({
      id: 'saveConfig',
      label: 'Save Config',
      // eslint-disable-next-line no-bitwise
      keybindings: [KeyMod.CtrlCmd | KeyCode.KeyS],
      run: () => {
        this.saveFile().then(console.log).catch(console.log);
      },
    });
    monaco.editor.addEditorAction({
      id: 'openConfig',
      label: 'Open Config',
      // eslint-disable-next-line no-bitwise
      keybindings: [KeyMod.CtrlCmd | KeyCode.KeyO],
      run: () => {
        this.openFile().then(console.log).catch(console.log);
      },
    });
  }

  handleKeyPress = (event: KeyboardEvent) => {
    console.log(`You pressed ${event.key}`);
  };

  handleBackButton = () => {
    this.setState({ popupLeave: true });
  };

  backToHomeScreen = () => {
    const { App } = this.props;
    App.setState({ openScreen: 'home', openPopup: false });
  };

  abortBackToHomeScreen = () => {
    this.setState({ popupLeave: false });
  };

  onChange = async (newValue: string, e: any) => {
    const { type } = this.state;
    try {
      const json = JSON.parse(newValue);
      const valid = await window.electron.validate(JSON.parse(newValue), type);
      if (typeof valid === 'string') {
        this.setState({ codeError: valid });
      } else {
        this.setState({ codeError: '' });
      }
    } catch (error) {
      console.log(error);
    }
    console.log(typeof newValue);
    this.setState({ code: newValue });
  };

  openFile = async () => {
    const json = await window.electron.dialog.openConfig();
    if (json) {
      try {
        this.setState({
          codeError: '',
          popupLeave: false,
          code: JSON.stringify(json, null, 4),
        });
      } catch (e) {
        console.log(e);
      }
      await this.onChange(JSON.stringify(json), null);
    }
  };

  saveFile = async () => {
    const { type, code } = this.state;
    switch (type) {
      case 'board':
        await window.electron.dialog.saveBoardConfig(code);
        break;
      case 'partie':
      default:
        await window.electron.dialog.savePartieConfig(code);
        break;
    }
  };

  changeType = (e: React.ChangeEvent<HTMLSelectElement>) => {
    switch (e.target.value) {
      case 'board':
        this.setState({ type: 'board' });
        break;
      case 'partie':
      default:
        this.setState({ type: 'partie' });
    }
  };

  render() {
    let popupLeaveR = null;
    const { popupLeave, type } = this.state;
    if (popupLeave) {
      popupLeaveR = (
        <ConfirmPopup
          label="Validator wirklich verlassen?"
          onConfirm={this.backToHomeScreen}
          onAbort={this.abortBackToHomeScreen}
        />
      );
    }
    const { code, codeError } = this.state;
    const errorMsg: ReactElement[] = [];
    if (codeError === '') {
      errorMsg[0] = <div className="flex fex-cols gap-2 p-2">VALID</div>;
    } else {
      try {
        let i = 0;
        JSON.parse(codeError).forEach(
          (e: {
            instancePath: any;
            message:
              | string
              | number
              | boolean
              | React.ReactElement<
                  any,
                  string | React.JSXElementConstructor<any>
                >
              | React.ReactFragment
              | React.ReactPortal
              | null
              | undefined;
          }) => {
            errorMsg[i] = (
              <div className="flex fex-cols pt-2">
                <p className="mr-4 pr-4 border-r">
                  {i + 1 < 10 ? `0${i + 1}` : i + 1}
                </p>
                <p className="font-black text-red-500">
                  {`${e.instancePath}`}&nbsp;
                </p>
                <p>{e.message}</p>
              </div>
            );
            i += 1;
          }
        );
        // eslint-disable-next-line no-empty
      } catch (e) {}
    }

    return (
      <div>
        <div className="dragger absolute top-0 left-0 w-[100vw] h-8" />
        <div className="flex flex-col h-[100vh]">
          <div className="text-white w-[100vw]">
            <div className="m-8 flex flex-col gap-8 justify-start">
              <div className="flex flex-row justify-start gap-8">
                <BiChevronLeft
                  className="text-4xl border border-white cursor-pointer hover:bg-accent-500"
                  onClick={this.handleBackButton}
                />
                <div className="text-4xl">Validator</div>
              </div>
            </div>
          </div>
          <div className="flex text-white bg-background-900 border-b font-lato">
            <button
              type="button"
              className="bg-accent-500/25 hover:bg-accent-500 text-lg p-2 flex flex-row justify-center items-center gap-2 border-r"
              onClick={this.openFile}
            >
              <AiFillFolderOpen /> Öffnen
            </button>
            <button
              type="button"
              className="bg-accent-500/25 hover:bg-accent-500 text-lg p-2 flex flex-row justify-center items-center gap-2 border-r"
              onClick={this.saveFile}
            >
              <HiSaveAs /> Speichern
            </button>
            <p className="bg-accent-500/10 text-lg p-2 flex flex-row justify-center items-center gap-2">
              Type:
            </p>
            <div className="border-r">
              <select
                className="bg-accent-500/25 hover:bg-accent-500 text-lg p-2 flex flex-row justify-center items-center gap-2 border-r-4 border-transparent"
                onChange={this.changeType}
                value={type}
              >
                <option className="rounded-none" value="partie">
                  Partie Konfiguration
                </option>
                <option className="rounded-none" value="board">
                  Board Konfiguration
                </option>
              </select>
            </div>
          </div>
          <div className="grow relative h-full">
            <div className="bg-[#30344F] h-[75%]">
              <MonacoEditor
                language="json"
                height="100%"
                width="100%"
                theme="vs-dark"
                value={code}
                onChange={this.onChange}
              />
            </div>
            <div className="h-[5%] text-white flex flex-col justify-center border-b">
              <div className="text-xl pl-4">Error</div>
            </div>
            <div className="w-full bg-[#30344F] h-[20%] text-white">
              <div className="h-full max-h-full font-mono overflow-auto pl-8">
                {errorMsg}
              </div>
            </div>
          </div>
        </div>
        {popupLeaveR}
      </div>
    );
  }
}

export default JSONValidator;
