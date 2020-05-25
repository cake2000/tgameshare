/* global tinymce */

import React from 'react';
import PropTypes from 'prop-types';
import CodeMirror from 'react-codemirror';
import Script from 'react-load-script';
import TinyMCE from 'react-tinymce';
import adminEnums from '../../configs/adminEnums.js';
import '../../../../../node_modules/codemirror/lib/codemirror.css';

require('codemirror/mode/javascript/javascript');
require('codemirror/mode/xml/xml');
require('codemirror/mode/markdown/markdown');


class AdminAddEditGamePracticeForm extends React.Component {
  static propTypes = {
    lesson: PropTypes.object,
    updateTutorial: PropTypes.func.isRequired,
    tutorialId: PropTypes.string,
    closeModal: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
    let lesson = {
      userId: 'system',
      package: adminEnums.LESSON_LEVEL.STARTED,
      ScenarioName: '',
      ScenarioSequenceNumber: 1,
      SetupScript: '// Setup script for this scenario here',
      Difficulty: 1,
      instructionContent: ['']
    };
    if (props.lesson) {
      lesson = props.lesson;
      if (!lesson.instructionContent) {
        lesson.instructionContent = [''];
      }
    }
    this.state = {
      lesson,
      scriptLoaded: false,
      selectedIntruction: 0,
      instructionContent: lesson.instructionContent ? lesson.instructionContent[0] : ''
    };
  }

  componentDidUpdate (prevProps, prevState) {
    if (prevState.selectedIntruction !== this.state.selectedIntruction
      && this.state.scriptLoaded === true) {
      tinymce.activeEditor.setContent(this.state.instructionContent);
    }
  }


  updateCode = (newCode) => {
    const { lesson } = this.state;
    lesson.SetupScript = newCode;
    this.setState({
      lesson
    });
  }

  changeValue = (type, e) => {
    const { lesson, selectedIntruction } = this.state;
    let value = e.target.value;
    if (type === 'Difficulty' || type === 'ScenarioSequenceNumber') {
      value = Number(value);
    }
    if (type === 'instructionContent') {
      const content = e.target.getContent();
      lesson.instructionContent[selectedIntruction] = content;
    } else {
      lesson[type] = value;
    }
    this.setState({ lesson });
  }

  saveChanges = () => {
    this.props.updateTutorial(this.props.tutorialId, this.state.lesson, () => {
      this.props.closeModal();
    });
  }

  handleScriptLoad = () => {
    this.setState({ scriptLoaded: true });
  }

  handleScriptError = () => (
    <div className="admin-msg-err">
        Can not load script
      </div>
    )

  selectInstructionItem =(index) => {
    const { lesson } = this.state;
    this.setState({
      selectedIntruction: index,
      instructionContent: lesson.instructionContent[index]
    });
  }

  removeInstructionItem = (index) => {
    const { lesson } = this.state;
    lesson.instructionContent.splice(index, 1);
    this.setState({ lesson });
  }

  addInstructionStep = () => {
    const { lesson } = this.state;
    lesson.instructionContent.push('');
    this.setState({ lesson });
  }

  render() {
    const { lesson, scriptLoaded, selectedIntruction } = this.state;
    const options = {
      mode: 'javascript',
      lineNumbers: true,
      height: '50%'
    };
    return (
      <div className="admin-edit-game-practice admin-form">
        <div className="admin-form__header">
          <strong>Add new practice lesson</strong>
        </div>
        <div className="admin-form__block">
          <div className="admin-form__item">
            <label className="admin-form__item__label" htmlFor="text-input">Scenario Name</label>
            <div className="admin-form__item__input">
              <input
                type="text"
                value={lesson.ScenarioName}
                onChange={(e) => { this.changeValue('ScenarioName', e); }}
                id="text-input"
                name="text-input"
                className="admin-form__item__input__control"
              />
            </div>
          </div>
          <div className="admin-form__item">
            <label className="admin-form__item__label" htmlFor="text-input">Scenario sequence</label>
            <div className="admin-form__item__input">
              <input
                type="text"
                value={lesson.ScenarioSequenceNumber}
                onChange={(e) => { this.changeValue('ScenarioSequenceNumber', e); }}
                id="text-input"
                name="text-input"
                className="admin-form__item__input__control"
              />
            </div>
          </div>
          <div className="admin-form__item">
            <label className="admin-form__item__label" htmlFor="text-input">Package</label>
            <div className="admin-form__item__input">
              <select name="package" value={lesson.package} onChange={(e) => { this.changeValue('package', e); }}>
                {
                  _.map(adminEnums.LESSON_LEVEL.ARRAY_OBJECT, (object, index) => (
                    <option value={object.key} key={index}>{object.value}</option>)
                  )
                }
              </select>
            </div>
          </div>
          <div className="admin-form__item">
            <label className="admin-form__item__label" htmlFor="text-input">Difficulty</label>
            <div className="admin-form__item__input">
              <select name="difficulty" value={lesson.Difficulty} onChange={(e) => { this.changeValue('Difficulty', e); }}>
                {
                  _.map(adminEnums.LESSON_DIFFICULTY.ARRAY_OBJECT, (object, index) => (
                    <option value={object.key} key={index}>{object.value}</option>)
                  )
                }
              </select>
            </div>
          </div>
          <div className="admin-form__item">
            <label className="admin-form__item__label" htmlFor="text-input">Setup Script</label>
            <div className="admin-form__item__input">
              <CodeMirror
                value={lesson.SetupScript}
                options={options}
                onChange={this.updateCode}
              />
            </div>
          </div>
          <div className="admin-form__item">
            <label className="admin-form__item__label" htmlFor="text-input">Instruction</label>
            <div className="admin-form__item__input">
              <div className="step-rows">
                {
                  _.map(lesson.instructionContent, (item, index) => (
                    <div key={index} className="step-rows__item">
                      <button
                        type="button"
                        className={`admin-btn admin-btn--primary ${index === selectedIntruction ? 'step-rows__item--active' : ''}`}
                        onClick={() => { this.selectInstructionItem(index); }}
                      >
                        Step {index + 1}
                      </button>
                      <button
                        type="button"
                        className="admin-btn admin-btn--danger step-rows__item__add-btn"
                        onClick={() => { this.removeInstructionItem(index); }}
                      >
                        <i className="fa fa-trash-o" />
                      </button>
                    </div>
                  ))
                }
                <button
                  type="button"
                  className="admin-btn admin-btn--primary step-rows__add-btn"
                  onClick={() => { this.addInstructionStep(); }}
                >
                  <i className="fa fa-plus" />
                </button>
              </div>
              <Script
                url="https://cloud.tinymce.com/stable/tinymce.min.js"
                onError={() => { this.handleScriptError(); }}
                onLoad={() => { this.handleScriptLoad(); }}
              />
              { scriptLoaded ?
                <TinyMCE
                  content={this.state.instructionContent}
                  config={{
                    height: 500,
                    content_css: [
                      '//fonts.googleapis.com/css?family=Lato:300,300i,400,400i',
                      '//www.tinymce.com/css/codepen.min.css'
                    ],
                    image_advtab: true,
                    plugins: [
                      'advlist autolink lists link image charmap print preview hr anchor pagebreak',
                      'searchreplace wordcount visualblocks visualchars code fullscreen',
                      'insertdatetime media nonbreaking save table contextmenu directionality',
                      'emoticons template paste textcolor colorpicker textpattern imagetools codesample toc help'
                    ],
                    toolbar1: 'undo redo | insert | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image',
                    toolbar2: 'print preview media | forecolor backcolor emoticons | codesample help',
                  }}
                  onChange={(e) => { this.changeValue('instructionContent', e); }}
                /> : 'Loading tinymce ...'
              }
            </div>
          </div>
        </div>
        <div className="admin-form__footer">
          <button
            type="button"
            className="admin-btn admin-btn--primary"
            onClick={() => { this.saveChanges(); }}
          >Save changes</button>
          <button
            type="button"
            className="admin-btn admin-btn--primary"
            onClick={() => { this.props.closeModal(); }}
          >Cancel</button>
        </div>
      </div>
    );
  }
}

export default AdminAddEditGamePracticeForm;
