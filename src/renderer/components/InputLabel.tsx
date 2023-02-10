import React, { ChangeEvent } from 'react';
import _uniqueId from 'lodash/uniqueId';
import InputValidator from '../helper/InputValidator';

interface OnChangeFunctionInputLabel {
  (value: string | number): void;
}

type InputLabelProps = {
  label: string;
  type: string;
  placeholder?: string;
  value?: number | string | null;
  helperText?: string;
  validator?: InputValidator;
  min?: number;
  onChange: OnChangeFunctionInputLabel;
};
type InputLabelState = {
  hasWarning: boolean;
  warningText: string[];
  errorMsg: string[];
  isValid: boolean;
};

class InputLabel extends React.Component<InputLabelProps, InputLabelState> {
  private readonly id: string;

  static get defaultProps() {
    return {
      placeholder: '',
      value: null,
      helperText: '',
      validator: undefined,
      min: 0,
    };
  }

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
    const { value } = e.target;
    const { validator, onChange } = this.props;
    if (validator) {
      const { valid, warning } = validator.validate(value);
      this.setState({
        warningText: warning.text,
        isValid: valid.is,
        errorMsg: valid.text,
        hasWarning: warning.has,
      });
    }
    onChange(value);
  }

  render() {
    let helper: string | JSX.Element = '';

    const { helperText, label, min, type, placeholder, value } = this.props;

    if (helperText) {
      helper = <div>{helperText}</div>;
    }
    const { isValid, hasWarning, warningText, errorMsg } = this.state;
    let warningHelper: string | JSX.Element = '';
    let invalidHelper: string | JSX.Element = '';
    if (hasWarning) {
      warningHelper = (
        <div className="text-sm text-orange-400 pl-4">
          {warningText.join(' | ')}
        </div>
      );
    }
    if (!isValid && errorMsg) {
      invalidHelper = (
        <div className="text-sm text-red-400 pl-4">{errorMsg.join(' | ')}</div>
      );
    }
    let validClass = '';
    if (isValid) {
      if (hasWarning) {
        validClass = ' border-b-orange-400';
      }
    } else {
      validClass = ' border-b-red-400';
    }

    return (
      <div className="flex flex-col">
        <div>
          <label htmlFor={this.id} className="text-2xl">
            {label}
          </label>
        </div>
        <div>
          <input
            id={this.id}
            className={`bg-transparent border-b-2 text-xl px-4 py-2 focus:outline-none w-full${validClass}`}
            type={type}
            placeholder={placeholder}
            onChange={this.handleOnChange}
            min={min || -1}
            value={value?.toString()}
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
