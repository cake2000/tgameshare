import React, { Component } from 'react';
import jQuery from 'jquery';
import 'bootstrap/js/dist/modal';
import 'bootstrap/js/dist/dropdown';
import 'bootstrap/js/dist/tooltip';
// import 'summernote/dist/summernote-lite';
import _isEmpty from 'lodash/isEmpty';
import { ACTION_TYPE_SUPPORT_MESSAGE } from '../../../../lib/enum';

class LessonChatEditor extends Component {
  state = {
    contents: ''
  }

  componentDidMount() {
    const that = this;

    window.lessonChatHandleChange = this.handleOnChange.bind(this);

    document
      .querySelector('#editorIframe')
      .contentWindow
      .onload = function() {
        if (window.summernote) window.summernote.setOnChangeHandler(that.handleOnChange);
      };
  }

  sendMessage = (value) => {
    const { chatSupport } = this.props;
    const userId = Meteor.userId();
    const isSupporter = Meteor.user().isSupporter();

    if (isSupporter && !chatSupport) return;
    if (userId) {
      Meteor.call(
        'lessonChatHistory.create',
        chatSupport ? chatSupport._id : null,
        value,
        userId,
        isSupporter ? ACTION_TYPE_SUPPORT_MESSAGE.SUPPORT_TEXT : ACTION_TYPE_SUPPORT_MESSAGE.USER_TEXT
      );
    }
  };

  sendMessageAndClearChatBox = () => {
    this.sendMessage(this.getSummernoteHtmlContent());
    this.clearSummernoteContent();
  }

  sendDissatisfaction = () => {
    this.sendMessage('<p>I\'m not satisfied with your answer</p>');
  }

  getSummernoteHtmlContent = () => document
    .querySelector('#editorIframe')
    .contentWindow
    .summernote.code();

  clearSummernoteContent = () => document
    .querySelector('#editorIframe')
    .contentWindow
    .summernote.reset();

  handleOnChange = (we, contents) => {
    this.setState({ contents });
  }



  render () {
    const { contents } = this.state;

    const checkIsEmpty = (contents) => {
      contents = contents.replace(/<(?:.|\n)*?>/gm, '');
      return contents.trim() == "";
      // return _isEmpty(contents);
    };

    return (
      <div className="lesson_chat_editor_container">
        <iframe src="/summernote.html" width="100%" height="220px" id="editorIframe" title="summernote" />
        <div className="lesson_chat_editor">
          {/* <button type="button" className="btn sendChatButton" onClick={this.sendDissatisfaction}>Not satisfied</button> */}
          <button type="button" className="btn sendChatButton" onClick={this.sendMessageAndClearChatBox} disabled={
            checkIsEmpty(contents)
          }>Send</button>
        </div>
      </div>
    );
  }
}

export default LessonChatEditor;
