import React from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-modal';
import classNames from 'classnames';
import moment from 'moment';
import { Link } from 'react-router-dom';
import swal from 'sweetalert';
import GameRoomTournamentRegisteredModalContent from '../containers/GameRoomTournamentRegisteredModalContent';
import {
  LINK, TOURNAMENT_STATUS,
  TOURNAMENT_SECTION_ROUND_STATUS,
  TOURNAMENT_SECTION_TYPE
} from '../../../../lib/enum.js';

const statusMap = {
  'In Preparation': 'PENDING',
  'In Progress': 'UNDERWAY',
  Ended: 'COMPLETED'
};

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    paddingLeft: '30px',
    paddingRight: '30px',
    paddingTop: '20px',
    paddingBottom: '20px',
    overflow: 'hidden',
    maxWidth: '680px',
    width: 'calc(100% - 30px)',
    maxHeight: 'calc(100vh - 30px)',
    transform: 'translate(-50%, -50%)',
    borderRadius: '0',
    border: 'none',
  },
  overlay: {
    backgroundColor: 'rgba(4, 4, 4, 0.75)',
    zIndex: 999
  }
};

export default class GameRoomTournamentRegister extends React.Component {

  static propTypes = {
    tournament: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    history: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    sections: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    withdrawTournamentSection: PropTypes.func.isRequired,
    title: PropTypes.string
  };

  static defaultProps = {
    title: ''
  }

  constructor(props) {
    super(props);
    this.state = {
      registerdIsOpen: false,
      registerSectionId: '',
    };
  }

  getSectionClassname = section => classNames({
    tourranking__info__component: true,
    'tourranking__info__component--registered': section.registeredUserIds.findIndex(r => r.userId === Meteor.userId()) !== -1
  });

  openModal = (e, id) => {
    this.setState({ registerdIsOpen: true, registerSectionId: id });
  }

  closeModal = () => {
    this.setState({ registerdIsOpen: false });
  }

  withdraw = (e, sectionId) => {
    e.preventDefault();
    const {
      withdrawTournamentSection
    } = this.props;

    swal({
      title: "Can you confirm you are withdrawing from this tournament?",
      text: "",
      icon: "warning",
      buttons: {
        cancel: {
          text: "Keep registered",
          value: null,
          visible: true,
          className: "",
          closeModal: true,
        },
        confirm: {
          text: "withdraw registration",
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
          withdrawTournamentSection(sectionId, Meteor.userId(), () => {
            // withdraw successful
          });
        }
      });
  }

  renderSectionStatus = (section) => {
    if (!section) return "";
    if (section.type === "New Registration") {
      return section.status;
    }
    return TOURNAMENT_SECTION_ROUND_STATUS(section.currentRound, section.numberOfRounds)[statusMap[section.status]];
  }


  renderAction = (isTournamentRegistered, isSectionRegistered, section) => {
    const {
      tournament,
    } = this.props;
    const {
      _id,
      type
    } = section;
    let view;

    if (tournament.status === TOURNAMENT_STATUS.PREPARED &&
      type === TOURNAMENT_SECTION_TYPE.NEW_REGISTRATION &&
      !isTournamentRegistered) {
      view = (
        <div className="tourranking__info__action__register">
          <button
            onClick={e => this.openModal(e, _id)}
          >
            Register
        </button>
        </div>
      );
    } else if (tournament.status !== TOURNAMENT_STATUS.END && isSectionRegistered) {
      view = (
        <button onClick={e => this.withdraw(e, _id)}>Withdraw</button>
      );
    }
    return view;
  }

  renderEnterAction = (section) => {
    const {
      tournament
    } = this.props;
    const view = (
      <Link
        // onClick={e => this.handleModal(section._id, e)}
        to={`/section-info/${tournament.gameId}/${section._id}`}
      >
        {LINK.ENTER}
      </Link>
    );
    return view;
  }

  checkUserRegisteredTournament = () => {
    const { sections } = this.props;
    return sections.some(section => this.checkUserRegisteredSection(section) === true);
  }

  checkUserRegisteredSection = (section) => {
    return section.registeredUserIds.some(player => player.userId === Meteor.userId());
  }

  render() {
    const { tournament, sections, title } = this.props;
    const isTournamentRegistered = this.checkUserRegisteredTournament();
    return (
      <div className="tournament--info__ranking">
        <Modal
          isOpen={this.state.registerdIsOpen}
          onRequestClose={this.closeModal}
          style={customStyles}
          contentLabel="Register"
        >
          <GameRoomTournamentRegisteredModalContent
            onClose={this.closeModal}
            sectionId={this.state.registerSectionId}
            tournament={tournament}
            title={title}
          />
        </Modal>
        <div className="tourranking__header">
          <div className="tourranking__header__section">Section Name</div>
          <div className="tourranking__header__starttime">Start Time</div>
          <div className="tourranking__header__player">Players</div>
          <div className="tourranking__header__status">Status</div>
          <div className="tourranking__header__action">Registration</div>
          <div className="tourranking__header__action">Section Details</div>
        </div>
        <div className="tourranking__info">
          {
            _.map(sections, (section, index) => {
              const isSectionRegistered = this.checkUserRegisteredSection(section);
              return (
                <div
                  key={index}
                  className={this.getSectionClassname(section)}
                >
                  <div className="tourranking__info__name">
                    <span>{section.name}</span>
                  </div>
                  <div className="tourranking__info__starttime">
                    <span>{moment(section.startTime).format('MMMM DD, HH:mmA z')}</span>
                  </div>
                  <div className="tourranking__info__player">
                    <span>{`${section.registeredUserIds.length} players`}</span>
                  </div>
                  <div className="tourranking__info__status">
                    <span>
                      {this.renderSectionStatus(section)}
                    </span>
                  </div>
                  <div className="tourranking__info__action">
                    {this.renderAction(isTournamentRegistered, isSectionRegistered, section)}
                  </div>
                  <div className="tourranking__info__action">
                    {this.renderEnterAction(section)}
                  </div>

                </div>
              );
            })
          }
        </div>
      </div>
    );
  }
}
