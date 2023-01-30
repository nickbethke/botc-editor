import React, { ReactElement } from 'react';
import App from '../App';
import { BiChevronLeft } from 'react-icons/bi';
import { AiFillFolderOpen } from 'react-icons/ai';
import { ConfirmPopup } from './ConfirmPopup';
import MonacoEditor from 'react-monaco-editor/lib/editor';


type JSONValidatorProps = {
  App: App
}
type JSONValidatorState = {
  popupLeave: boolean,
  code: string,
  codeError: string
}

export class JSONValidator extends React.Component<JSONValidatorProps, JSONValidatorState> {
  constructor(props: JSONValidatorProps) {
    super(props);
    this.handleBackButton = this.handleBackButton.bind(this);
    this.backToHomeScreen = this.backToHomeScreen.bind(this);
    this.abortBackToHomeScreen = this.abortBackToHomeScreen.bind(this);
    this.openFile = this.openFile.bind(this);

    this.state = {
      popupLeave: false, code: '',
      codeError: ''
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

  editorDidMount(editor: { focus: () => void; }, monaco: any) {
    console.log('editorDidMount', editor, monaco);
    editor.focus();
  }

  onChange = async (newValue: any, e: any) => {
    const valid = await window.electron.validate(newValue);
    console.log(valid);
    if (typeof valid == 'string') {
      this.setState({ codeError: valid });
    } else {
      this.setState({ codeError: '' });
    }
    console.log('onChange', newValue, e, valid);
  };

  openFile = async () => {
    const json = await window.electron.dialog.openConfig();
    if (json) {
      this.setState({ code: JSON.stringify(json, null, 4) });
      await this.onChange(JSON.stringify(json), null);
    }
  };

  render() {
    let popupLeave = null;
    if (this.state.popupLeave) {
      popupLeave = (
        <ConfirmPopup label={'Validator wirklich verlassen?'} onConfirm={this.backToHomeScreen}
                      onAbort={this.abortBackToHomeScreen} />);
    }
    const { code, codeError } = this.state;
    let errorMsg: ReactElement[] = [];
    if (codeError == '') {
      errorMsg[0] =
        <div className={'flex fex-cols gap-2 p-2'}>VALID</div>;
    } else {
      try {
        let i = 0;
        JSON.parse(codeError).forEach((e: { instancePath: any; message: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | React.ReactFragment | React.ReactPortal | null | undefined; }) => {
          errorMsg[i] =
            <div className={'flex fex-cols gap-2 p-2'}><p className={'font-black'}>{e.instancePath || ' '}</p>
              <p>{e.message}</p></div>;
          i++;
        });
      } catch (e) {
        console.log(e);
      }
    }

    const options = {
      selectOnLineNumbers: false
    };

    return (
      <div>
        <div className='dragger absolute top-0 left-0 w-[100vw] h-8' />
        <div className={'text-white w-[100vw]'}>
          <div className={'m-8 flex flex-col gap-8 justify-start'}>
            <div className={'flex flex-row justify-start gap-8'}>
              <BiChevronLeft className={'text-4xl border border-white cursor-pointer hover:bg-accent-500'}
                             onClick={this.handleBackButton} />
              <div className={'text-4xl'}>Validator</div>
            </div>
          </div>
        </div>
        <div className={'font-lato'}>
          <div className={'flex gap-8 text-white bg-background-900 border-b'}>
            <button
              className={'bg-accent-500/25 hover:bg-accent-500 text-lg p-2 flex flex-row justify-center items-center gap-2'}
              onClick={this.openFile}><AiFillFolderOpen /> Konfiguration öffnen
            </button>
          </div>
          <div className={'flex flex-row h-[66vh]'}>
            <div className={'w-full bg-[#30344F] h-full'}>
              <MonacoEditor
                width='100%'
                height='100%'
                language='json'
                theme='vs-dark'
                value={code}
                options={options}
                onChange={this.onChange.bind(this)}
                editorDidMount={this.editorDidMount.bind(this)}
              />
            </div>
            <div className={'w-full bg-[#30344F] h-full text-white'}>
              <div className={'h-full max-h-full overflow-auto font-mono'}>
                {errorMsg}
              </div>
            </div>
          </div>
        </div>
        {popupLeave}
      </div>
    );
  }

}
