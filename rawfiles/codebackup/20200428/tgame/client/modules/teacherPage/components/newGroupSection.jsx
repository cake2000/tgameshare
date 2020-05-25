import React from 'react';
import {
  USER_GROUP_VISIBILITY,
  USER_GROUP_MENTION,
  USER_GROUP_NOTIFICATION,
  USER_GROUP_MESSAGE,
} from '../../../../lib/enum';
import Input from '../../components/components/Input.jsx';
import { classForm } from '../../../../lib/form-validation';

export const sections = [
  {
    title: 'Visibility',
    key: 'visibility',
    fields: [
      {
        label: 'Who can see this group?',
        key: 'canSee',
        type: 'select',
        options: USER_GROUP_VISIBILITY,
        validate: classForm.isRequired,
      },
    ]
  },
  {
    title: 'Posting',
    key: 'posting',
    fields: [
      {
        label: 'Who can @mention this group?',
        key: 'canMention',
        type: 'select',
        options: USER_GROUP_MENTION,
        validate: classForm.isRequired,
      },
      {
        label: 'Who can message this group?',
        key: 'canMessage',
        type: 'select',
        options: USER_GROUP_MESSAGE,
        validate: classForm.isRequired,
      },
    ]
  },
  {
    title: 'Notification',
    key: 'notification',
    fields: [
      {
        label: 'Default notification level for group messages',
        key: 'notificationLevel',
        type: 'select',
        options: USER_GROUP_NOTIFICATION,
        validate: classForm.isRequired,
      },
    ]
  }
];

const renderSection = section => (
  <div className="newclassform--content--hos--content--section" key={section.key}>
    <hr className="newclassform--content--hos--content--section-separator" />
    <div className="newclassform--content--hos--content--section--title">
      <span>{section.title}</span>
    </div>
    <div className="newclassform--content--hos--content--section--fields">
      {
        section.fields.map(field => (
          <div className="newclassform--content--hos--content--section--field" key={field.key}>
            <div className="newclassform--content--hos--content--section--field--label">
              <span>{field.label}</span>
            </div>
            <div className="newclassform--content--hos--content--section--field--items">
              <Input
                id={field.key}
                name={field.key}
                type={field.type}
                validate={field.validate}
                options={field.options}
                className="newclassform--content--hos--content--section--field--input"
              />
            </div>
          </div>
        ))
      }
    </div>
  </div>
);


const NewGroupSection = () => (
  <div>
    <div className="newclassform--content--hos--header">
      <span className="newclassform--content--hos--header--title">New User Group</span>
    </div>
    <div className="newclassform--content--hos--content">
      {sections.map(renderSection)}
    </div>
  </div>
);

export default NewGroupSection;
