import React from 'react';

type ConfirmPopupProps = {
  label: string;
  text?: string;

  confirmText?: string;
  abortText?: string;
  onConfirm: () => void;
  onAbort?: () => void;
};
type ConfirmPopupStats = {
  visible: boolean;
};

export class ConfirmPopup extends React.Component<
  ConfirmPopupProps,
  ConfirmPopupStats
> {
  constructor(props: ConfirmPopupProps) {
    super(props);
    this.handleConfirm = this.handleConfirm.bind(this);
    this.handleAbort = this.handleAbort.bind(this);
    this.state = { visible: true };
  }

  handleConfirm = () => {
    this.setState({ visible: false });
    this.props.onConfirm();
  };
  handleAbort = () => {
    this.setState({ visible: false });
    this.props.onAbort && this.props.onAbort();
  };

  render() {
    if (!this.state.visible) {
      return null;
    }
    return (
      <div className="absolute w-[100vw] h-[100vh] top-0 left-0 bg-background-800/75">
        <div>
          <div className="absolute top-[50%] left-[50%] translate-y-[-50%] translate-x-[-50%]">
            <div className={'p-8 bg-accent-700 text-white'}>
              <div className="text-center text-3xl mb-8">
                {this.props.label}
              </div>
              <div className={'mb-8'}>{this.props.text}</div>
              <div className={'flex flex-row gap-8'}>
                <button
                  className={
                    'w-full border border-white p-4 hover:bg-accent-500 text-lg'
                  }
                  onClick={this.handleAbort}
                >
                  {this.props.abortText || 'Abbrechen'}
                </button>
                <button
                  className={
                    'w-full border border-white p-4 hover:bg-accent-500 text-lg'
                  }
                  onClick={this.handleConfirm}
                >
                  {this.props.confirmText || 'OK'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
