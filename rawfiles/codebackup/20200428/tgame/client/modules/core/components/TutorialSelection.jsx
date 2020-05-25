import React, { PureComponent } from 'react';
import Select from 'react-select';
import PropTypes from 'prop-types';
import GameOption from './GameOption.jsx';
import GameValue from './GameValue.jsx';

function arrowRenderer() {
  return (
    <span style={{ color: '#000', fontSize: 15 }}><i className="fa fa-caret-down" /></span>
  );
}

class TutorialSelection extends PureComponent {
  selectTutorial = (game) => {
    const { onSelect } = this.props;
    if (game && _.isFunction(onSelect)) {
      onSelect(game);
    }
  }

  render() {
    const { value, options } = this.props;

    return (
      <Select
        onChange={this.selectTutorial}
        options={options}
        value={value}
        optionComponent={GameOption}
        valueComponent={GameValue}
        searchable={ false }
        clearable={false}
        labelKey="label"
        valueKey="value"
        arrowRenderer={arrowRenderer}
        placeholder="Select Tutorial"
      />
    );
  }
}

TutorialSelection.propTypes = {
  onSelect: PropTypes.func.isRequired,
  value: PropTypes.string,
  options: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string,
    value: PropTypes.string
  })).isRequired
};

TutorialSelection.defaultProps = {
  value: '',
  defaultValue: null
};

export default TutorialSelection;
