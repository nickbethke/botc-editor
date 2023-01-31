import React, { ChangeEvent } from 'react';
import PartieKonfigurator from './PartieKonfigurator';
import _uniqueId from 'lodash/uniqueId';
import { InputValidator } from '../helper/InputValidator';

interface onChangeFunctionInputLabel {
  (value: string | number): void;
}

type InputLabelProps = {
  editor: PartieKonfigurator;
  label: string;
  type: string;
  placeholder?: string;
  value?: number | string | null;
  helperText?: string;
  validator?: InputValidator;
  min?: number;
  onChange: onChangeFunctionInputLabel;
};
type _InputLabelState = {
  hasWarning: boolean;
  warningText: string[];
  errorMsg: string[];
  isValid: boolean;
};

class InputLabel extends React.Component<InputLabelProps, _InputLabelState> {
  private readonly id: string;

  constructor(props: InputLabelProps) {
    super(props);
    this.id = _uniqueId('input-label-');
    this.handleOnChange = this.handleOnChange.bind(this);
    this.state = {
      isValid: true,
      hasWarning: false,
      errorMsg: [],
      warningText: [],
    };
  }

  handleOnChange(e: ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    if (this.props.validator) {
      const { valid, warning } = this.props.validator.validate(value);
      this.setState({
        warningText: warning.text,
        isValid: valid.is,
        errorMsg: valid.text,
        hasWarning: warning.has,
      });
    }
    this.props.onChange(value);
  }

  render() {
    let helper: string | JSX.Element = '';
    if (this.props.helperText) {
      helper = <div>{this.props.helperText}</div>;
    }
    const { isValid, hasWarning, warningText, errorMsg } = this.state;
    let warningHelper: string | JSX.Element = '';
    let invalidHelper: string | JSX.Element = '';
    if (hasWarning) {
      warningHelper = (
        <div className={'text-sm text-orange-400 pl-4'}>
          {warningText.join(' | ')}
        </div>
      );
    }
    if (!isValid && errorMsg) {
      invalidHelper = (
        <div className={'text-sm text-red-400 pl-4'}>
          {errorMsg.join(' | ')}
        </div>
      );
    }
    return (
      <div className={'flex flex-col'}>
        <div>
          <label htmlFor={this.id} className={'text-2xl'}>
            {this.props.label}
          </label>
        </div>
        <div>
          <input
            id={this.id}
            className={
              'bg-transparent border-b-2 text-xl px-4 py-2 focus:outline-none w-full' +
              (isValid
                ? hasWarning
                  ? ' border-b-orange-400'
                  : ''
                : ' border-b-red-400')
            }
            type={this.props.type}
            placeholder={this.props.placeholder && this.props.placeholder}
            onChange={this.handleOnChange}
            min={this.props.min || -1}
            value={this.props.value?.toString()}
          />
        </div>
        {helper}
        {warningHelper}
        {invalidHelper}
      </div>
    );
  }
}

export default InputLabel;
