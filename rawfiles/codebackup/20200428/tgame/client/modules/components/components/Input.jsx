import React from 'react';
import PropTypes from 'prop-types';

class Input extends React.Component {
  static propTypes = {
    options: PropTypes.arrayOf(PropTypes.any)
  }
  static defaultProps = {
    options: []
  }
  constructor(props) {
    super(props);
    this.state = {
      error: ''
    };
  }
  onChange = () => {
    this.validate();
  };
  onBlur = () => {
    this.validate();
  };
  validate = () => {
    const { validate } = this.props;
    if (validate) {
      const value = this.el.value || '';
      this.setState({
        error: validate(value)
      });
    }
  }
  render() {
    const pureProps = { ...(this.props) };
    delete (pureProps.validate);
    delete (pureProps.options);
    const { error } = this.state;
    return (
      <div className="t-input">
        {
          this.props.type === 'select' ?
            <select
              {...pureProps}
              ref={(el) => { this.el = el; }}
              onChange={this.onChange}
            >
              {
                this.props.options.map(opt => (
                  <option value={opt.value} key={opt.value}>{opt.name}</option>
                ))
              }
            </select> :
            <input
              {...pureProps}
              ref={(el) => { this.el = el; }}
              onChange={this.onChange}
            />
        }
        {error &&
          <div className="t-input--error">
            <span>{`${pureProps.name} ${error}`}</span>
          </div>
        }
      </div>
    );
  }
}

export default Input;
