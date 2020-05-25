import React, { Component } from 'react';
import TopNavBar from './TopNavBar.jsx';
import { MIGRATION_CONST } from '../../../../lib/enum';
import LoadingPage from '../../loading/components/loadingPage.jsx';

const gameId = MIGRATION_CONST.appleharvestGameId;
class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      game: null
    };
  }

  componentWillMount() {
    this.getGame();
  }

  getGame = () => {
    if (gameId) {
      Meteor.call('games.item', gameId, (error, result) => {
        if (!error) {
          this.setState({
            game: result
          });
        }
      });
    }
  }

  render() {
    const {
      notifications,
      tournamentInfoList,
      accept,
      decline,
      joinRoom,
      rounds,
      cancel,
      viewResult,
      unReadSupportChatCount,
      isProfessionalUser,
      acceptClick,
      declineClick,
      clearErrors,
      invitationNotifyCount,
      history,
      handleModal,
      userData,
      clearGameBoardData,
      hideComponent
    } = this.props;
    const { game } = this.state;
    if (hideComponent) return null;
    return game ? (
      <TopNavBar
        clearGameBoardData={clearGameBoardData}
        unReadSupportChatCount={unReadSupportChatCount}
        history={history}
        handleModal={handleModal}
        notifications={notifications}
        invitationNotifyCount={invitationNotifyCount}
        tournamentInfoList={tournamentInfoList}
        accept={accept}
        decline={decline}
        joinRoom={joinRoom}
        rounds={rounds}
        cancel={cancel}
        viewResult={viewResult}
        isProfessionalUser={isProfessionalUser}
        acceptClick={acceptClick}
        declineClick={declineClick}
        clearErrors={clearErrors}
        game={game}
        userData={userData}
      />
    ) : <LoadingPage />;
  }
}

export default Header;
