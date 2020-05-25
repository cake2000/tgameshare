import React, { Component } from 'react';
import Autosuggest from 'react-autosuggest';
import 'react-table/react-table.css';
import moment from 'moment';
import swal from 'sweetalert';
import ReactTable from 'react-table';
import { Link } from 'react-router-dom';
import LoadingIcon from '../../../lib/LoadingIcon.jsx';
import GeneralModal from '../../modal/modal.jsx';
import NewClassForm from './newClassForm.jsx';
import {DEFAULT_BATTLE_PROJECT_ID} from '../../../../lib/enum.js'

// var users = [
//   {
//     nickname: 'crazyfrog',
//     email: 'frog@foobar.com'
//   },
//   {
//     nickname: 'tatanka',
//     email: 'ttt@hotmail.com'
//   },
//   {
//     nickname: 'wild',
//     email: 'www@mail.ru'
//   },
//   {
//     nickname: 'race car',
//     email: 'racing@gmail.com'
//   },
//   {
//     nickname: 'cook',
//     email: 'cooking@yahoo.com'
//   },
// ];

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

var users = [];
var users2 = [];

// https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expressions#Using_Special_Characters
function escapeRegexCharacters(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getSuggestions(value) {
  const escapedValue = escapeRegexCharacters(value.trim());
  const regex = new RegExp(escapedValue, 'i');
  
  return users.filter(user => regex.test(user.nickname) || regex.test(user.email));
}

function getSuggestionNickname(suggestion) {
  return suggestion.nickname + " - " + suggestion.email;
}


function getSuggestionEmail(suggestion) {
  return suggestion.email;
}

function renderSuggestion(suggestion) {
  return (
    <span>{suggestion.nickname} - {suggestion.email}</span>
  );
}

class MyAutosuggest extends React.Component {
  constructor() {
    super();

    this.state = {
      value: '',
      suggestions: []
    };    
  }

  onChange = (_, { newValue }) => {
    const { id, onChange } = this.props;
    
    this.setState({
      value: newValue
    });
    
    onChange(id, newValue);
  };
  
  onSuggestionsFetchRequested = ({ value }) => {
    this.setState({
      suggestions: getSuggestions(value)
    });
  };

  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: []
    });
  };

  render() {
    const { id, placeholder } = this.props;
    const { value, suggestions } = this.state;
    const inputProps = {
      placeholder,
      value,
      onChange: this.onChange
    };
    
    return (
      <Autosuggest 
        id={id}
        suggestions={suggestions}
        onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
        onSuggestionsClearRequested={this.onSuggestionsClearRequested}
        getSuggestionValue={getSuggestionNickname}
        renderSuggestion={renderSuggestion}
        inputProps={inputProps} 
      />
    );
  }
}


const { timeZone } = Intl.DateTimeFormat().resolvedOptions();
const styleColumn = {
  style: {
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerStyle: {
    borderBottom: '1px solid white',
  }
};
const columns = context => ([{
  Header: 'Class Name',
  id: 'classname',
  accessor: item => ({ _id: item._id, name: item.name }),
  width: 210,
  ...styleColumn,
  Cell: row => (context.state.rename._id === row.value._id ?
    (
      <div className="rename">
        <input type="text" className="rename--input" value={context.state.rename.name} onChange={context.onChange} />
        <button
          type="button"
          className="admin-btn admin-btn--trans step-rows__item__add-btn"
          onClick={(e) => { context.onRenameClass(e, row.value._id); }}
        >
          <i className="fa fa-check" />
        </button>
      </div>
    ) :
    (
      <div className="rename">
        <div className="rename--label">{row.value.name}</div>
        <button
          type="button"
          className="admin-btn admin-btn--trans step-rows__item__add-btn"
          onClick={(e) => { context.prevRename(e, row.value._id, row.value.name); }}
        >
          <i className="fa fa-edit" />
        </button>
      </div>
    ))
}, {
  Header: 'Students',
  id: 'numbofstudent',
  width: 100,
  ...styleColumn,
  accessor: item => item.numbOfStudents,
}, {
  Header: 'Created Time',
  id: 'createdtime',
  ...styleColumn,
  accessor: item => `${moment(item.createdTime).tz(timeZone).format('MMM DD, HH:mm A')} ${timeZone}`,
  width: 300,
}, 
// {
//   Header: 'Game',
//   id: 'game',
//   ...styleColumn,
//   accessor: item => item.game,
//   width: 210,
// // }, {
// //   Header: 'Class Forum',
// //   id: 'classforum',
// //   ...styleColumn,
// //   accessor: item => `https://forum.tgame.ai/c/classarea/${item._id}`,
// //   width: 120,
// //   Cell: row => (<a target="_blank" href={row.value}>Go</a>)
// }, 
{
  Header: 'Manage Class',
  id: 'viewprogress',
  ...styleColumn,
  //accessor: item => `/class/${item._id}`,
  accessor: item => ({ _id: item._id, url: `/class/${item._id}`, showSolutionButton: item.showSolutionButton }),
  width: 120,
  Cell: row => (
    <Link className="logDetailButton" to={row.value.url} >Open</Link>
  )
}, 
{
  Header: 'Fast Forward',
  id: 'viewprogress',
  ...styleColumn,
  accessor: item2 => ({ _id: item2._id, url: `/class/${item2._id}`, showFastForwardButton: item2.showFastForwardButton }),
  width: 120,
  Cell: row => (
    <button
      type="button"
      className="admin-btn admin-btn--trans step-rows__item__add-btn"
      onClick={(e) => { context.toggleFastForward(e, row.value); }}
    >
      {row.value.showFastForwardButton ? "Disable" : "Enable"}
    </button>
  )
},
{
  Header: 'Solutions',
  id: 'viewprogress',
  ...styleColumn,
  accessor: item => ({ _id: item._id, url: `/class/${item._id}`, showFastForwardButton: item.showFastForwardButton, showSolutionButton: item.showSolutionButton }),
  width: 120,
  Cell: row => (
    <button
      type="button"
      className="admin-btn admin-btn--trans step-rows__item__add-btn"
      onClick={(e) => { context.toggleSolutionButton(e, row.value); }}
    >
      {row.value.showSolutionButton ? "Hide" : "Show"}
    </button>
  )
},
{
  Header: 'Remove',
  id: 'remove',
  ...styleColumn,
  accessor: item => item._id,
  width: 120,
  Cell: row => (
    <button
      type="button"
      className="admin-btn admin-btn--trans step-rows__item__add-btn"
      onClick={(e) => { context.onRemoveClass(e, row.value); }}
    >
      <i className="fa fa-trash-o" />
    </button>
  )
}]);

class TeacherPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isModalOpen: false,
      rename: {
        _id: null,
        name: ''
      },
      nicknameValue: '',
      nicknameSuggestions: [],
      nicknameValue2: '',
      nicknameSuggestions2: [],
      projectIDValue: DEFAULT_BATTLE_PROJECT_ID
    };
  }

  onNicknameChange = (event, { newValue }) => {
    this.setState({
      nicknameValue: newValue
    });
  };
  onNicknameChange2 = (event, { newValue }) => {
    this.setState({
      nicknameValue2: newValue
    });
  };

  onChange = (e) => {
    const value = e.target.value || '';
    this.setState(prevState => ({
      rename: { ...prevState.rename, name: value }
    }));
  }

  onRenameClass = (e, _id) => {
    e.preventDefault();
    const { renameClass } = this.props;
    const name = this.state.rename.name;
    swal({
      title: "This class will be renamed",
      text: "",
      icon: "warning",
      buttons: {
        cancel: {
          text: "cancel",
          value: null,
          visible: true,
          className: "",
          closeModal: true,
        },
        confirm: {
          text: "rename class",
          value: true,
          visible: true,
          className: "",
          closeModal: true
        }
      },
      dangerMode: true,
    })
      .then((confirmed) => {
        if (confirmed) {
          renameClass(_id, name, (error) => {
            if (!error) {
              this.setState({
                rename: {
                  _id: null,
                  name: ''
                }
              });
            } else {
              alert(error.message);
            }
          });
        } else {
          this.setState({
            rename: {
              _id: null,
              name: ''
            }
          });
        }
      });
  }

  toggleSolutionButton = (e, classObj) => {
    e.preventDefault();

    if (classObj.showSolutionButton) {
      swal({
        title: "All 'solution' buttons for quick exercises and coding challenges will be hidden.",
        text: "",
        icon: "warning",
        buttons: {
          cancel: {
            text: "cancel",
            value: null,
            visible: true,
            className: "",
            closeModal: true,
          },
          confirm: {
            text: "Hide Solution Buttons",
            value: true,
            visible: true,
            className: "",
            closeModal: true
          }
        },
        dangerMode: true,
      })
      .then((confirmed) => {
        if (confirmed) {
          Meteor.call('toggleSolutionButton', classObj._id);
        }
      });
    } else {
      swal({
        title: "All 'solution' buttons for quick exercises and coding challenges will be displayed.",
        text: "",
        icon: "warning",
        buttons: {
          cancel: {
            text: "cancel",
            value: null,
            visible: true,
            className: "",
            closeModal: true,
          },
          confirm: {
            text: "Show Solution Buttons",
            value: true,
            visible: true,
            className: "",
            closeModal: true
          }
        },
        dangerMode: true,
      })
      .then((confirmed) => {
        if (confirmed) {
          Meteor.call('toggleSolutionButton', classObj._id);
        }
      });
    }

    
  }




  toggleFastForward = (e, classObj) => {
    e.preventDefault();

    if (classObj.showFastForwardButton) {
      swal({
        title: "Students will not be allowed to fast forward to the next slide.",
        text: "",
        icon: "warning",
        buttons: {
          cancel: {
            text: "cancel",
            value: null,
            visible: true,
            className: "",
            closeModal: true,
          },
          confirm: {
            text: "Disable Fast Forward",
            value: true,
            visible: true,
            className: "",
            closeModal: true
          }
        },
        dangerMode: true,
      })
      .then((confirmed) => {
        if (confirmed) {
          Meteor.call('toggleFastForwardButton', classObj._id);
        }
      });
    } else {
      swal({
        title: "Students will be able to fast forward to the next slide (except for challenge and quiz slides that they have to answer).",
        text: "",
        icon: "warning",
        buttons: {
          cancel: {
            text: "cancel",
            value: null,
            visible: true,
            className: "",
            closeModal: true,
          },
          confirm: {
            text: "Enable fast forward",
            value: true,
            visible: true,
            className: "",
            closeModal: true
          }
        },
        dangerMode: true,
      })
      .then((confirmed) => {
        if (confirmed) {
          Meteor.call('toggleFastForwardButton', classObj._id);
        }
      });
    }

    
  }

  onRemoveClass = (e, _id) => {
    e.preventDefault();

    const { removeClass } = this.props;
    swal({
      title: "This class will be removed together with the class forum!",
      text: "",
      icon: "warning",
      buttons: {
        cancel: {
          text: "cancel",
          value: null,
          visible: true,
          className: "",
          closeModal: true,
        },
        confirm: {
          text: "remove class",
          value: true,
          visible: true,
          className: "",
          closeModal: true
        }
      },
      dangerMode: true,
    })
      .then((confirmed) => {
        if (confirmed) {
          removeClass(_id, (error) => {
            if (error) {
              alert(error.message);
            }
          });
        }
      });
  }

  onNewClassBtnClick = (e) => {
    e.preventDefault();
    this.toggleModal();
  }

  onAddNewClass = (form) => {
    const { addClass } = this.props;
    addClass(form, (error) => {
      if (!error) {
        this.toggleModal();
      }
    });
  }

  onCancel = () => {
    this.setState({
      isModalOpen: false
    });
  }

  prevRename = (e, _id, oldName) => {
    this.setState(() => ({
      rename: {
        _id,
        name: oldName
      }
    }));
  }

  toggleModal = () => {
    this.setState(preState => ({ isModalOpen: !preState.isModalOpen }));
  }

  handleProjectID = (e) => {
    const { value } = e.target;

    this.setState({ projectIDValue: value });
  };

  componentDidMount() {
    const { students, studentsWithCode } = this.props;
    // const me = Meteor.user();
    // users = [{
    //   nickname: me.username,
    //   email: me.emails[0].address, 
    //   userId: me._id
    // }];
    // studentsWithCode.forEach(s => {
    //   if (s._id !== me._id) {
    //     users.push({
    //       nickname: s.username,
    //       email: s.emails[0].address, 
    //       userId: s._id
    //     });
    //   }
    // });
  }

  onPlayerChange(id, newValue) {
    console.log(`${id} changed to ${newValue}`);
    if (id == "player1") {
      this.setState({
        nicknameValue: newValue
      });
    } else {
      this.setState({
        nicknameValue2: newValue
      });
    }

  }

  getPID(target) {
    let p = users.find(u => { return (u.nickname + " (" + u.email + ")") == target});
    return p.userId;
  }

  startBattle() {
    const { 
      // nicknameValue, 
      // nicknameValue2, 
      projectIDValue
    } = this.state;
    const {history } = this.props;

    if ($("#playerinput1").val().trim() == "") {
      swal({
        title: "Please select player 1 first.",
        text: "",
        icon: "warning",
      });
      return;
    }

    if ($("#playerinput2").val().trim() == "") {
      swal({
        title: "Please select player 2 first.",
        text: "",
        icon: "warning",
      });
      return;
    }

    //history.push(`scratchbattle`, { projectID: projectIDValue, player1: getPID(nicknameValue), player2: getPID(nicknameValue2)});
    history.push(`/scratchbattle/${projectIDValue}|${this.getPID($("#playerinput1").val())}|${this.getPID($("#playerinput2").val())}`);
  }

  render() {
    const { classes, studentsWithCode } = this.props;

    const { 
      nicknameValue, 
      nicknameValue2, 
      projectIDValue
    } = this.state;
    
    const me = Meteor.user();
    users = [];
    users2 = [];
    // users = [{
    //   nickname: me.username,
    //   email: me.emails[0].address, 
    //   userId: me._id
    // }];
    // users2 = [{
    //   nickname: me.username,
    //   email: me.emails[0].address, 
    //   userId: me._id
    // }];
    studentsWithCode.forEach(s => {
        users.push({
          nickname: s.username,
          email: s.emails[0].address, 
          userId: s._id
        });
        users2.push({
          nickname: s.username,
          email: s.emails[0].address, 
          userId: s._id
        });
    });



    // const nicknameInputProps = {
    //   placeholder: "user name and email",
    //   value: nicknameValue,
    //   onChange: this.onNicknameChange
    // };

    // const nicknameInputProps2 = {
    //   placeholder: "user name and email",
    //   value: nicknameValue2,
    //   onChange: this.onNicknameChange2
    // };

    /* test data */
    const isLoading = false;
    const disableLoadmore = true;

    const { isModalOpen } = this.state;
    // const infoComplete = $("#playerinput1").val().trim().indexOf("@") >= 0 && $("#playerinput2").val().trim().indexOf("@") >= 0 && projectIDValue.length >= 9 && isNumeric(projectIDValue) ;
    const infoComplete = projectIDValue.length >= 9 && isNumeric(projectIDValue) ;
    return (
      <div className="teacherPageClass">
        <GeneralModal isOpen={isModalOpen} contentLabel="New Class">
          <NewClassForm onSubmit={this.onAddNewClass} onCancel={this.onCancel} />
        </GeneralModal>
        <br />
        <center><h2 className="teacherPageClass-title">All My Classes</h2></center>
        <div className="teacherPageClass--content">
          {/* <div className="teacherPageClass--content__header"> */}
            {/* <input
              type="text"
              placeholder="Player name, game, level"
              value={this.state.keyword}
              onChange={e => this.handleChangeInput(e.target.value)}
            />
            <i className="fa fa-search" aria-hidden="true" /> */}
          {/* </div> */}
          <div className="teacherPageClass--content__table--teacher">
            <div className="teacherPageClass--content__table--action" style={{marginBottom: "10px"}}>
              <button className="btn" onClick={this.onNewClassBtnClick}>Create New Class</button>
            </div>
            <ReactTable
              NoDataComponent={() => null}
              showPagination={false}
              pageSize={classes.length}
              data={classes}
              columns={columns(this)}
            />
          </div>
          {
            isLoading &&
            <div className="teacherPageClass--content__body--wrapper__body--loading">
              <LoadingIcon
                height={'50px'}
              />
            </div>
          }
          {
            (!disableLoadmore && !isLoading) &&
            <div className="teacherPageClass--content__body--button">
              <button
                onClick={() => this.handleLoadMore()}
                disabled={isLoading ? 'disabled' : null}
              >
                Load more
              </button>
            </div>
          }

<br/>
<br/>
<br/>
          <center><h2 className="teacherPageClass-title" style={{color: "blue"}}>Scratch Tank Battle Game</h2></center>
          <br/>
          <label style={{fontSize: '20px', color: "blue", marginBottom:'6px'}}>Project ID</label>
          <input  onChange={(e) => { this.handleProjectID(e); }} style={{fontSize: '20px',  marginBottom:'12px', textAlign: 'center', width: "200px"}} value={projectIDValue}></input>
          <br/>


<table>
  <tbody>
  <tr>
    <td>
    <label  style={{textAlign: 'center', display: 'block', color: "blue", fontSize: '20px', marginBottom:'6px'}}>Player 1</label>
          {/* <Autosuggest 
            id="playerinput1"
            suggestions={nicknameSuggestions}
            onSuggestionsFetchRequested={this.onNicknameSuggestionsFetchRequested}
            onSuggestionsClearRequested={this.onNicknameSuggestionsClearRequested}
            getSuggestionValue={getSuggestionNickname}
            renderSuggestion={renderSuggestion}
            inputProps={nicknameInputProps}
          /> */}
        {/* <MyAutosuggest
          id="player1"
          onChange={this.onPlayerChange.bind(this)}
        /> */}

        <input id = 'playerinput1' name = 'playerinput1' type = 'text' list='optionlist' className = 'playerinput' required placeholder = 'users with AI release' required/>

        <datalist id="optionlist">
    {users.map((item, key) =>
      <option key={key} value={item.nickname + " (" + item.email + ")"} />
    )}
  </datalist>

    </td>
    <td style={{width: '100px', verticalAlign: "top"}}>
      {/* <label  style={{textAlign: 'center', display: 'block', fontSize: '20px', marginBottom:'6px', width: '60px'}}>  </label> */}
      <img src="/images/vssign.png" style={{marginRight: 'auto', marginLeft: 'auto', display: 'block', width: "45px",  marginTop:'2px'}}></img>
    </td>
    <td>
    <label  style={{textAlign: 'center', display: 'block', color: "blue", fontSize: '20px', marginBottom:'6px'}}>Player 2</label>
          {/* <Autosuggest 
            id="playerinput2"
            suggestions={nicknameSuggestions2}
            onSuggestionsFetchRequested={this.onNicknameSuggestionsFetchRequested2}
            onSuggestionsClearRequested={this.onNicknameSuggestionsClearRequested2}
            getSuggestionValue={getSuggestionNickname}
            renderSuggestion={renderSuggestion}
            inputProps={nicknameInputProps2}
          /> */}
        {/* <MyAutosuggest
          id="player2"
          onChange={this.onPlayerChange.bind(this)}
        /> */}

<input id = 'playerinput2' name = 'playerinput2' type = 'text' list='optionlist2' className = 'playerinput' required placeholder = 'users with AI release' required/>

<datalist id="optionlist2">
    {users2.map((item, key) =>
      <option key={key} value={item.nickname + " (" + item.email + ")"} />
    )}
  </datalist>
    </td>
  </tr>
  </tbody>
</table>


      <center style={{marginTop:"20px"}}>
        <button
          className="btn charged-btn"
          type="button"
          disabled={!infoComplete}
          onClick={() => this.startBattle()}
        >
          Load Game
        </button>
      </center>

        </div>
      </div>
    );
  }
}

export default TeacherPage;
