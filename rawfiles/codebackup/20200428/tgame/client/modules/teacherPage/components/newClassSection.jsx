import React from 'react';
import Input from '../../components/components/Input.jsx';
import { classForm } from '../../../../lib/form-validation';
import { GAME_OPTIONS } from '../../../../lib/enum';

export const fields = [
  {
    label: 'Class Name',
    key: 'name',
    type: 'text',
    validate: classForm.isRequired,
  },
  // {
  //   label: 'Game',
  //   key: 'game',
  //   type: 'select',
  //   validate: classForm.isRequired,
  //   options: GAME_OPTIONS
  // },
];

const renderFields = field => (
  <div className="newclassform--content--hos--content--field" key={field.key}>
    <div className="newclassform--content--hos--content--field--label">
      <span>{field.label}</span>
    </div>
    <div className="newclassform--content--hos--content--field--items">
      <Input
        id={field.key}
        name={field.key}
        type={field.type}
        validate={field.validate}
        options={field.options}
        className="newclassform--content--hos--content--field--input"
      />
    </div>
  </div>
);

const NewClassSection = () => (
  <div>
    {/* <div className="newclassform--content--hos--header">
      <span className="newclassform--content--hos--header--title">Create New Class</span>
    </div> */}
    <div className="newclassform--content--hos--content">
      {fields.map(renderFields)}
    </div>
  </div>
);

export default NewClassSection;
