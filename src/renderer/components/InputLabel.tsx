import React, { ChangeEvent } from 'react';
import PartieKonfigurator from './PartieKonfigurator';
import _uniqueId from 'lodash/uniqueId';
import { InputValidator } from '../helper/InputValidator';
import { forEach } from 'lodash';
import { functions } from 'electron-log';

interface onChangeFunctionInputLabel {
  (value: string | number): void;
}

type InputLabelProps = {
  editor: PartieKonfigurator
  label: string,
  type: string,
  placeholder?: string
  value?: number | string | null,
  helperText?: string
  validator?: InputValidator,
  min?: number
  onChange: onChangeFunctionInputLabel
}
type InputLabelState = {
  hasWarning: boolean,
  warningText: string[],
  error: string[],
  valid: boolean,
}

class InputLabel extends React.Component<InputLabelProps, InputLabelState> {
  private readonly id: string;

  constructor(props: InputLabelProps) {
    super(props);
    this.id = _uniqueId('input-label-');
    this.handleOnChange = this.handleOnChange.bind(this);
  }

  state: InputLabelState = {
    valid: true,
    hasWarning: false,
    error: [],
    warningText: []
  };

  handleOnChange(e: ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    if (this.props.validator) {
      const { valid, warning } = this.props.validator.validate(value);
      this.setState({ warningText: warning.text, valid: valid.is, error: valid.text, hasWarning: warning.has });
    }
    this.props.onChange(value);
  }

  render() {
    let helper: string | JSX.Element = '';
    if (this.props.helperText) {
      helper = (<div>{this.props.helperText}</div>);
    }
    const { valid, hasWarning, warningText, error } = this.state;
    let warningHelper: string | JSX.Element = '';
    let invalidHelper: string | JSX.Element = '';
    if (hasWarning) {
      warningHelper = (<div className={'text-sm text-orange-400 pl-4'}>{warningText.join(' | ')}</div>);
    }
    if (!valid && error) {
      invalidHelper = (<div className={'text-sm text-red-400 pl-4'}>{error.join(' | ')}</div>);
    }
    return (
      <div className={'flex flex-col'}>
        <div><label htmlFor={this.id} className={'text-2xl'}>{this.props.label}</label></div>
        <div><input id={this.id}
                    className={'bg-transparent border-b-2 text-xl px-4 py-2 focus:outline-none w-full' + (valid ? hasWarning ? ' border-b-orange-400' : '' : ' border-b-red-400')}
                    type={this.props.type}
                    placeholder={this.props.placeholder && this.props.placeholder}
                    onChange={this.handleOnChange} min={(this.props.min || -1)}
                    value={this.props.value?.toString()}
        /></div>
        {helper}
        {warningHelper}
        {invalidHelper}
      </div>
    );
  }
}

export default InputLabel;
