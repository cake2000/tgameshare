@watch
Feature: GamesBoard page

#Scenario: Tgame gamesboard page load success - Play myself - Beginner
#  And I expect that element "#select-game h1.select-game-title" contains the text "Select Game"
#  And I expect that element "#select-game .game__info img" has the class "game__info__image"
#  And I expect that element "#select-game .game__info .game__info__title" contains the text "Trajectory Pool"
#  And I expect that element "#select-game .tutorial-video-link" contains the text "Quick Tour Video"
#  When I click on the button "#select-game .tutorial-video-link"
#  And I wait on element ".modal-video-body" for 5000ms to exist
#  When I click on the button "#select-game .modal-video-close-btn"
#  And I wait on element "#select-game" for 5000ms to exist
#  When I click on the button "#select-game .game__info__image"
#  And I wait on element "#game-mode" for 5000ms to exist
#  And I expect that element "#game-mode h1.game-mode-title" contains the text "Game Mode"
#  When I click on the button ".game-mode-myself"
#  And I wait on element "#difficulty" for 5000ms to exist
#  And I expect that element "#difficulty h1.difficulty-title" contains the text "Difficulty"
#  When I click on the button ".game-level-Beginner"
#  And I wait on element ".page--gamesroom" for 5000ms to exist
#  And I expect that element "#select-option-entry .player--selection" has "2" elements
#  When I click on the button ".page--gamesroom .item-info .change-item-button"
#  And I wait on element ".upgrade-item-wrapper" for 5000ms to exist
#  When I click on the button ".modal__header--close"
#  And I wait on element ".page--gamesroom" for 5000ms to exist
#  When I click on the button ".change-Table-button"
#  And I wait on element ".upgrade-item-wrapper" for 5000ms to exist
#  When I click on the button ".modal__header--close"
#  And I wait on element ".page--gamesroom" for 5000ms to exist
#  When I click on the button ".breadcum-entry"
#  And I wait on element ".game--wrapper" for 5000ms to exist

Scenario: Tgame gamesboard page load success - Play myself - Advanced
  When I click on the button "#select-game .game__info__image:nth-child(1)" in browser 0
  And I wait on element "#game-mode" in browser 0 for 5000ms to exist
  When I click on the button ".game-mode-myself" in browser 0
  And I wait on element "#difficulty" in browser 0 for 5000ms to exist
  When I click on the button "#difficulty .level--wrapper:nth-child(1)" in browser 0
  And I wait on element ".page--gamesroom" in browser 0 for 5000ms to exist
  And I expect that element "#select-option-entry .player--selection" in browser 0 has "2" elements
  When I click on the button ".page--gamesroom .item-info .change-item-button" in browser 0
  And I wait on element ".upgrade-item-wrapper" in browser 0 for 5000ms to exist
  When I click on the button ".modal__header--close" in browser 0
  And I wait on element ".page--gamesroom" in browser 0 for 5000ms to exist
  When I click on the button ".change-Table-button" in browser 0
  And I wait on element ".upgrade-item-wrapper" in browser 0 for 5000ms to exist
  When I click on the button ".modal__header--close" in browser 0
  And I wait on element ".page--gamesroom" in browser 0 for 5000ms to exist
#  Then I should see a screenshot of the browser view and save with name "BeforeStartGame"
#  When I click on the button ".breadcum-entry"
#  And I wait on element ".game--wrapper" for 5000ms to exist
  When I click on the button ".button--startgame" in browser 0
  Then I wait until 5000ms in browser 0
  And I wait on element ".gameWrapper" in browser 0 for 10000ms to exist
  Given I open the site "/player" in browser 0
  And I wait on element "#player-home" in browser 0 for 5000ms to exist

#  And I should see a screenshot of the browser view and save with name "game-play"

#Scenario: Tgame gamesboard page load success - Play online - Beginner
#  When I click on the button "#select-game .game__info__image"
#  And I wait on element "#game-mode" for 5000ms to exist
#  When I click on the button ".game-mode-playernetwork"
#  And I wait on element "#difficulty" for 5000ms to exist
#  When I click on the button ".game-level-Beginner"
#  And I wait on element ".page--gamesroom" for 5000ms to exist
#  When I click on the button ".page--gamesroom .item-info .change-item-button"
#  And I wait on element ".upgrade-item-wrapper" for 5000ms to exist
#  When I click on the button ".modal__header--close"
#  And I wait on element ".page--gamesroom" for 5000ms to exist
#  When I click on the button ".change-Table-button"
#  And I wait on element ".upgrade-item-wrapper" for 5000ms to exist
#  When I click on the button ".modal__header--close"
#  And I wait on element ".page--gamesroom" for 5000ms to exist
#  When I click on the button ".breadcum-network"
#  And I wait on element ".game--wrapper" for 5000ms to exist
#
#Scenario: Tgame gamesboard page load success - Play online - Advanced
#  When I click on the button "#select-game .game__info__image"
#  And I wait on element "#game-mode" for 5000ms to exist
#  When I click on the button ".game-mode-playernetwork"
#  And I wait on element "#difficulty" for 5000ms to exist
#  When I click on the button ".game-level-Advanced"
#  And I wait on element ".page--gamesroom" for 5000ms to exist
#  When I click on the button ".page--gamesroom .item-info .change-item-button"
#  And I wait on element ".upgrade-item-wrapper" for 5000ms to exist
#  When I click on the button ".modal__header--close"
#  And I wait on element ".page--gamesroom" for 5000ms to exist
#  When I click on the button ".change-Table-button"
#  And I wait on element ".upgrade-item-wrapper" for 5000ms to exist
#  When I click on the button ".modal__header--close"
#  And I wait on element ".page--gamesroom" for 5000ms to exist
#  When I click on the button ".breadcum-network"
#  And I wait on element ".game--wrapper" for 5000ms to exist
#  When I click on the button "#menu-top .navbar-invitations"
#  When I pause for 2000ms
