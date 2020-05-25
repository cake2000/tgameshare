import React from 'react';
import PropTypes from 'prop-types';
import { getBase64String } from '../../configs/helpers.js';
import { LEVELS, OPPONENTS, LEVEL_IMAGES } from '../../../../../lib/enum';
import AdminGamePracticeTab from '../../containers/Games/AdminGamePracticeTab.js';
import LoadingPage from '../../../loading/components/loadingPage.jsx';

class AdminGameForm extends React.Component {
  static propTypes = {
    updateGame: PropTypes.func,
    closeForm: PropTypes.func.isRequired
  }

  static defaultProps = {
    game: null,
    updateGame: null
  }

  constructor(props) {
    super(props);
    const game = {
      title: '',
      description: '',
      name: '',
      imageUrl: '',
      teamSize: 1,
      teamNumber: 2,
      level: [],
      opponent: []
    };
    this.state = {
      game,
      activeTab: 1,
    };
  }

  componentWillMount() {
    const {
      gameId
    } = this.props;
    if (!!gameId) {
      this.getGame(gameId);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.gameId !== this.props.gameId) {
      this.getGame(nextProps.gameId);
    }
  }

  getGame = async (gameId) => {
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

  handleCheckbox(e, type, value) {
    const isChecked = e.target.checked;
    const { game } = this.state;
    if (type === 'level') {
      const levelObj = {
        name: value,
        imageUrl: LEVEL_IMAGES[value],
      };
      if (isChecked) {
        game.level.push(levelObj);
      } else {
        game.level = _.without(game.level, _.findWhere(game.level, {
          name: value
        }));
      }
    }
    if (type === 'opponent') {
      const opponentObj = OPPONENTS[value.toUpperCase()];
      if (isChecked) {
        game.opponent.push(opponentObj);
      } else {
        game.opponent = _.without(game.opponent, _.findWhere(game.opponent, {
          name: value
        }));
      }
    }
    this.setState({ game });
  }

  handleUpload = () => {
    const game = this.state.game;
    const fileImages = $('#file-input')[0].files;
    _.map(fileImages, (fileImage) => {
      getBase64String(fileImage, { height: 415, width: 594 }, (base64String) => {
        game.imageUrl = base64String;
        this.setState({ game });
      });
    });
  }

  changeValue(property, e) {
    const value = e.target.value;
    const { game } = this.state;

    game[property] = value;
    this.setState({ game });
  }

  validateForm = () => {
    let errCount = 0;
    const { game } = this.state;
    if (game.title.trim() === '' ||
      game.description.trim() === '' ||
      game.name.trim() === '' ||
      game.imageUrl.trim() === '') { errCount += 1; }

    return errCount;
  }

  updateGame = () => {
    const { updateGame, gameId } = this.props;
    if (this.validateForm() > 0) {
      return null;
    }
    return updateGame(gameId, this.state.game, () => {
      this.props.closeForm();
    });
  }

  isCheck(type, value) {
    const { game } = this.state;
    if (type === 'level' && game.level.length > 0) {
      const currentLevel = _.findWhere(game.level, { name: value });
      if (currentLevel) { return true; } return false;
    }
    if (type === 'opponent' && game.opponent.length > 0) {
      const currentOpponent = _.findWhere(game.opponent, { name: value });
      if (currentOpponent) { return true; } return false;
    }
    return false;
  }

  changeTab = (id) => {
    this.setState({ activeTab: id });
  }

  renderGeneralTab = () => {
    const { game } = this.state;
    return (
      <div className="admin-form">
        <div className="admin-form__block">
          <div className="admin-form__item">
            <label className="admin-form__item__label" htmlFor="text-input">Title</label>
            <div className="admin-form__item__input">
              <input
                type="text"
                value={game.title}
                onChange={(e) => { this.changeValue('title', e); }}
                id="text-input"
                name="text-input"
                className="admin-form__item__input__control"
              />
            </div>
          </div>
          <div className="admin-form__item">
            <label className="admin-form__item__label" htmlFor="text-input">Name</label>
            <div className="admin-form__item__input">
              <input
                type="text"
                value={game.name}
                onChange={(e) => { this.changeValue('name', e); }}
                id="text-input"
                name="text-input"
                className="admin-form__item__input__control"
              />
            </div>
          </div>
          <div className="admin-form__item">
            <label className="admin-form__item__label" htmlFor="text-input">Team size</label>
            <div className="admin-form__item__input">
              <input
                type="text"
                value={game.teamSize}
                onChange={(e) => { this.changeValue('teamSize', e); }}
                id="text-input"
                name="text-input"
                className="admin-form__item__input__control"
              />
            </div>
          </div>
          <div className="admin-form__item">
            <label className="admin-form__item__label" htmlFor="text-input">Number of teams</label>
            <div className="admin-form__item__input">
              <input
                type="text"
                value={game.teamNumber}
                onChange={(e) => { this.changeValue('teamNumber', e); }}
                id="text-input"
                name="text-input"
                className="admin-form__item__input__control"
              />
            </div>
          </div>
          <div className="admin-form__item">
            <label className="admin-form__item__label" htmlFor="textarea-input">Description</label>
            <div className="admin-form__item__input">
              <textarea
                id="textarea-input"
                value={game.description}
                onChange={(e) => { this.changeValue('description', e); }}
                name="textarea-input"
                rows="4"
                className="admin-form__item__input__control"
              />
            </div>
          </div>
          <div className="admin-form__item--upload-image">
            <label className="admin-form__item--upload-image__label" htmlFor="logo">Game Logo</label>
            {
              game.imageUrl ?
                <div className="admin-form__item--upload-image__image">
                  <img
                    className="col-md-2 p-1 mr-3 float-left"
                    src={game.imageUrl}
                    alt="Game logo"
                    style={{ objectFit: 'cover', width: '100px', height: '100px' }}
                  />
                </div>
                : null
            }
            <div className="admin-form__item--upload-image__input">
              <input
                type="file"
                id="file-input"
                accept="image/*"
                onChange={this.handleUpload}
                className="admin-form__item--upload-image__input__control"
              />
            </div>
          </div>
          <div className="admin-form__item--checkbox">
            <label className="admin-form__item--checkbox__label" htmlFor="text-input">Levels</label>
            <div className="admin-form__item--checkbox__input">
              {
                _.map(LEVELS, (level, index) => {
                  const isChecked = this.isCheck('level', level);
                  return (<div key={index} className="checkbox-item">
                    <input
                      type="checkbox"
                      onChange={(e) => { this.handleCheckbox(e, 'level', level); }}
                      checked={isChecked}
                    />{level}
                  </div>);
                }
                )
              }
            </div>
          </div>
          <div className="admin-form__item--checkbox">
            <label className="admin-form__item--checkbox__label" htmlFor="text-input">Opponents</label>
            <div className="admin-form__item--checkbox__input">
              {
                _.map(OPPONENTS, (opponent, index) => {
                  const isChecked = this.isCheck('opponent', opponent.name);
                  return (
                    <div key={index} className="checkbox-item">
                      <input
                        type="checkbox"
                        onChange={(e) => { this.handleCheckbox(e, 'opponent', opponent.name); }}
                        checked={isChecked}
                      />{opponent.title}
                    </div>);
                }
                )
              }
            </div>
          </div>
        </div>
        <div className="admin-form__footer">
          <button type="button" className="admin-btn admin-btn--primary" onClick={this.updateGame}>Save changes</button>
          <button type="button" className="admin-btn admin-btn--primary" onClick={this.props.closeForm}>Cancel</button>
        </div>
      </div>
    );
  }

  renderLessonTab = () => (
    <AdminGamePracticeTab closeForm={this.props.closeForm} gameId={this.props.gameId} />
  )


  render() {
    const { activeTab } = this.state;
    const { game } = this.state;
    const tabs = [
      {
        id: 1,
        name: 'General Settings'
      },
      {
        id: 2,
        name: 'Tutorials'
      }
    ];
    return game ? (
      <div className="admin-game-form">
        <div className="admin-title">
          {game ? 'Edit game' : 'Add game'}
        </div>
        <div className="admin-tab">
          <div className="admin-tab__header">
            {
              _.map(tabs, (tab, index) =>
                (
                  <div
                    key={index}
                    onClick={() => { this.changeTab(tab.id); }}
                    className={`admin-tab__header__item ${activeTab === tab.id ? 'admin-tab__header__item--active' : ''}`}
                  >
                    <span>{tab.name}</span>
                  </div>
                ))
            }
          </div>
          <div className="admin-tab__content">
            {
              activeTab === 1 ?
                <div className="admin-tab__content__item">
                  {this.renderGeneralTab()}
                </div>
                : null
            }
            {
              activeTab === 2 ?
                <div className="admin-tab__content__item">
                  {this.renderLessonTab()}
                </div>
                : null
            }
          </div>
        </div>
      </div>
    ) : <LoadingPage />;
  }
}

export default AdminGameForm;
