import React, { Component } from 'react';
import _ from 'lodash';
import NewClassSection, { fields } from './newClassSection.jsx';
import NewGroupSection, { sections } from './newGroupSection.jsx';
import { objectifyForm } from '../../../../lib/util';
import { Classes } from '../../../../lib/collections';

class NewClassForm extends Component {
  static propTypes = {
  };

  static defaultProps = {
  };

  constructor(props) {
    super(props);
    this.state = {
      error: ''
    };
  }

  onSubmit = (e) => {
    e.preventDefault();
    const form = objectifyForm($('.newclassform').serializeArray());
    if (this.validate(form)) {
      const { onSubmit } = this.props;
      onSubmit(form);
    }
  }

  onCancel = (e) => {
    e.preventDefault();
    const { onCancel } = this.props;
    onCancel();
  }

  validate = (form) => {
    const userGroupField = sections.map(section => section.fields);
    //const allField = [].concat(fields, ...userGroupField);
    const allField = fields;

    const user = Meteor.user();
    if (!user) {
      throw new Meteor.Error('user not found');
    }
    const userId = user._id;
    const username = user.username.trim();
    const className = form.name.trim();
    const class_id = `${username}_${className}`;
    const isClassExisted = Classes.find({ class_id }).count() > 0;
    for (let i = 0; i < allField.length; i++) {
      const field = allField[i];
      const error = field.validate(form[field.key]);
      if (!_.isEmpty(error)) {
        this.setState({
          error: `${field.key} ${error}`
        });
        return false;
      }
      if (isClassExisted) {
        this.setState({
          error: `Class existed, please try another class name`
        });
      }
    }
    return true;
  }

  render() {
    return (
      <form className="newclassform" ref={el => (this.form = el)}>
        <div className="newclassform--content">
          <div className="newclassform--content--hos">
            <NewClassSection />
          </div>
          {/* <div className="newclassform--content--hos">
            <NewGroupSection />
          </div> */}
        </div>
        <div className="newclassform--error">
          <span>{this.state.error}</span>
        </div>
        <div className="newclassform--error">
          <span>{this.state.error}</span>
        </div>
        <div className="newclassform--action">
          <button className="btn" onClick={this.onSubmit}>Add Class</button>
          <button className="btn btn-transparent" onClick={this.onCancel}>Cancel</button>
        </div>
      </form>
    );
  }
}

export default NewClassForm;
