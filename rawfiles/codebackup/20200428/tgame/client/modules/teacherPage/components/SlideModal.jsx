import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import CodeMirror from 'react-codemirror';
import PropTypes from 'prop-types';
import Modal from 'react-modal';
import LoadingIcon from '../../../lib/LoadingIcon.jsx';

let RevealRef = null;
var gotoUserCurrentSlide = (slideContent, slideId) => {
  if (!RevealRef) return;
  window.currentSlideID = slideId;
  for (let k=0; k < slideContent.slideInfo.length; k++) {
    const slide = slideContent.slideInfo[k];
    if (slide.ID == slideId) {
      
      // debugger;
      const actualSlide = RevealRef.getIndices();
      if (actualSlide.v == Number(k) && !forceUpdate) return;
      // console.log("going to slide " + k + " from actual " + JSON.stringify(actualSlide) + ": " + slideId);
      RevealRef.slide(0, k, 100);
      return;
    }
  }
};

const StyleModal = {
  overlay: {
    backgroundColor: 'rgba(4, 4, 4, 0.88)'
  },
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    maxWidth: '800px',
    width: '80%',
    margin: '0 auto',
    background: 'transparent',
    border: 'none',
    color: '#fff',
    padding: '0px',
    display: 'flex',
    alignItems: 'center',
  }
};

export default class SlideModal extends Component {

  state = {
    error: null,
    success: '',
    isLoading: false
  };

  closeModal = () => {
    const { hideSlide } = this.props;

    this.setState({
      error: null,
      success: '',
      isLoading: false
    });
    hideSlide();
  };

  

  handleInput = (e) => {
    if (e.target.validationMessage.length > 0) {
      this.setState({ error: e.target.validationMessage });
    } else {
      this.setState({ error: null });
    }
  };

  componentDidMount() {
    const { showModal, selectedSlideId, slideFileId, slideContent } = this.props;
    const that = this;
    window.addEventListener( 'message', function( event ) {
      const { userLesson, slideContent } = that.props;
      if (event.data.indexOf("Meteor") == 0) return;
      // console.log("new message " + event.data);
      var data = JSON.parse( event.data );
      if( data.namespace === 'reveal' ) {
        // Slide changed, see data.state for slide number
        
        if (data.eventName == 'ready') {

          var iframes = document.getElementById('slides').getElementsByTagName('iframe');
          var iframe = iframes[0];
          // first time loading a new deck
          RevealRef = iframe.contentWindow.Reveal;
          // console.log("real start here! got reveal reference.");
          $("#slideIFrame").show();
          // hideNavArrows();
                    
          gotoUserCurrentSlide(slideContent, that.props.selectedSlideId);
        } else if (data.eventName == 'slidechanged' || data.eventName == 'framehidden') {
          that.showHideCodeSolution();
        }
      }
    } );    
  }

  getCurrentSlide() {
    const { slideContent, selectedSlideId } = this.props;

    let sid = selectedSlideId;
    if (RevealRef) {
      const notes = RevealRef.getSlideNotes();

      const nlines = notes.split("\n");
      const parts = nlines[0].replace("//", "").split("||");
      for (let x = 0; x < parts.length; x++) {
        // console.log("p " + x + " " + parts[x].trim());
        const pp = parts[x].trim().split(" ");
        if (pp[0].toUpperCase() == "#ID") {
          sid = pp[1].trim();
          break;
        }
      }
    }



    for (let k=0; k < slideContent.slideInfo.length; k++) {
      const s1 = slideContent.slideInfo[k];
      if (s1.ID == sid) {
        return s1;
      }
    }

  }

  showHideCodeSolution() {
    // const { userLesson, slide, slideContent, setPaused } = this.props;

    const s = this.getCurrentSlide();
    if (!s) {
      $("#codeSolution").hide();
      return;
    }

    if (s.PROJECTID.length > 0) {
      $("#codeSolution").hide();
      return;
    }

    if (s.TYPE.toLowerCase() != "solution") {
      $("#codeSolution").hide();
    } else {
      $("#codeSolution").show();
      if (s.ANSWERCODE)
        window.solutionCodeEditorModal.codeMirror.setValue(s.ANSWERCODE);
      else if (s.ANSWERSCRIPT) {
        window.solutionCodeEditorModal.codeMirror.setValue(s.ANSWERSCRIPT);
      }
      // CodeMirror.fromTextArea(document.getElementById("codeSolution"), {
      //   lineNumbers: true,
      //   readOnly: true
      // });
    }
  }

  render() {
    const { ul, showModal, selectedSlideId, slideFileId, slideContent, student } = this.props;
    const { error, isLoading, success } = this.state;
    // let slideTitle = "- "
    // for (let j=0; j<slideContent.slideInfo.length; j++) {
    //   if (slideContent.slideInfo[j].ID == selectedSlideId) {
    //     slideTitle = slideContent.slideInfo[j].TITLE;
    //     break;
    //   }
    // }
    if (selectedSlideId == "" || !showModal) {
      return (<div > </div>);
    }
    const log = ul.slideVisitLog.find(e => (e.slideId == selectedSlideId));
    log.result1 = "";
    log.icon = ""
    if (log.TYPE == "Quiz" && log.answer && log.answer != "") {
      if (log.answer == log.input) {
        log.result1 =  log.input ;
        log.icon = "check";
      } else {
        log.result1 = log.input;
        log.icon = "times";
      }
    }

    const s = this.getCurrentSlide();

    // const showSolution = s.TYPE.toLowerCase() == "solution";
    const options = {
      mode: 'javascript',
      lineNumbers: true,
      // autoRefresh:true,
      readOnly: true,
      // gutters: ['CodeMirror-lint-markers', 'CodeMirror-foldgutter'],
    };


    return (
      <Modal
        style={StyleModal}
        isOpen={!!showModal}
        contentLabel={'Modal'}
      >
        <div className="modal_block_general change-pw-modal">
          <div className="modalSlideTitle" style={{margin: "20px"}}>
            {/* <div className="modalSlideTitle">{"[" + student.profile.firstName + " " + student.profile.lastName + "] " + log.result1} {log.TYPE == "Quiz" && <FontAwesomeIcon style={{marginLeft: "2px", color: log.icon == "check" ? "green" : "red" }} icon={log.icon} />} </div> */}

            <div className="modalSlideTitle">{log.result1} {log.TYPE == "Quiz" && <FontAwesomeIcon style={{marginLeft: "2px", color: log.icon == "check" ? "green" : "red" }} icon={log.icon} />} </div>

            <button className="modalSlideCloseButton" onClick={this.closeModal} role="presentation">X</button>
          </div>
          <div className="modal__body">
            <div id="slides" className="modal__body--content">
              <iframe style={{display: "block"}} id="slideIFrame"  src={`/loadslide?postMessageEvents=true&slideId=${slideFileId}&rand=${Math.random().toFixed(10)}`} width="100%" scrolling="no" frameBorder="0"></iframe>
            </div>
          </div>

          <div style={{display: s && s.TYPE.toLowerCase() == "solution" ? ( s.PROJECTID.length > 0 ? "none" : "block" ) : "none", overflow: scroll}} id="codeSolution">
            <h2 style={{color: "white", textAlign: "center", marginBottom: "20px"}}>Solution</h2>
            <br />
            <div id="codemirrorFrame2" onclick="event.stopPropagation()">
              <CodeMirror 
                options={options} 
                ref={(ref) => {
                  if (ref != null ) {
                    window.solutionCodeEditorModal = ref;
                    if (s && s.TYPE.toLowerCase() == "solution") {
                      window.solutionCodeEditorModal.codeMirror.setValue(s.ANSWERCODE);
                    }
                  }}}
                />  
            </div>
          </div>

        </div>
      </Modal>
    );
  }
}

SlideModal.defaultProps = {
  userId: ''
};

SlideModal.propTypes = {
  // toggleResetLessonModal: PropTypes.func.isRequired,
  showModal: PropTypes.bool.isRequired,
  userId: PropTypes.string,
};
