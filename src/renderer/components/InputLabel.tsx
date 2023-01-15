import React from 'react';
import PartieKonfigurator from './PartieKonfigurator';
import _uniqueId from 'lodash/uniqueId';

type InputLabelProps = {
  editor: PartieKonfigurator
  label: string,
  type: string,
  placeholder?: string
  value?: number | string | null,
  helperText?: string
}
type InputLabelState = {
  name: string,
  maxRounds: number
}

class InputLabel extends React.Component<InputLabelProps, InputLabelState> {
  private id: string;

  constructor(props: InputLabelProps) {
    super(props);
    this.id = _uniqueId('prefix-');
  }

  render() {
    let helper: string | JSX.Element = '';
    if (this.props.helperText) {
      helper = (<div>{this.props.helperText}</div>);
    }
    return (
      <div className={'flex flex-col'}>
        <div><label htmlFor={this.id} className={'text-2xl'}>{this.props.label}</label></div>
        <div><input id={this.id} className={'bg-transparent border-b-2 text-xl px-4 py-2 focus:outline-none w-full'}
                    type={this.props.type}
                    placeholder={this.props.placeholder && this.props.placeholder} /></div>
        {helper}
      </div>
    );
  }
}

export default InputLabel;
