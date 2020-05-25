@watch
Feature: Player page

Scenario: Tgame player page load success
  And I expect that element ".player-page .player-list" in browser 0 has "5" elements
  And I expect that element ".player-info .player-list-items" in browser 0 has "2" elements
  When I click on the button ".update-info-button" in browser 0
  And I wait on element "#my-account" in browser 0 for 5000ms to exist
  When I click on the button "#menu-top .navbar-player" in browser 0
  And I wait on element "#player-home" in browser 0 for 5000ms to exist
#  When I click on the button ".landing-button"
#  And I wait on element "#landing-page" for 5000ms to exist
  And I expect that element ".player-statics .statics-item" in browser 0 has "4" elements
  And I expect that element ".player-upgrade .upgrade-list-items" in browser 0 has "2" elements
  And I expect that element ".player-upgrade .upgrade-list-items .upgrade-items" in browser 0 has "4" elements
  And I expect that element ".player-upgrade .upgrade-list-items .upgrade-items-image" in browser 0 has "2" elements
  When I click on the button ".upgrade-list-items:nth-child(1) .player-change-item-button" in browser 0
  And I wait on element ".upgrade-item-wrapper" in browser 0 for 5000ms to exist
  And I expect that element "#change-Cue-header .change-items" in browser 0 has "2" elements
  And I expect that element "#change-Cue-body .upgrade-item" in browser 0 has "9" elements
  When I click on the button ".modal__header--close" in browser 0
  When I pause for 1000ms in browser 0
  When I click on the button ".player-change-Table-button" in browser 0
  And I wait on element ".upgrade-item-wrapper" in browser 0 for 5000ms to exist
  And I expect that element "#change-Table-header .change-items" in browser 0 has "2" elements
  And I expect that element "#change-Table-body .upgrade-item" in browser 0 has "9" elements
  When I click on the button ".modal__header--close" in browser 0
  When I pause for 1000ms in browser 0
  And I expect that element ".player-recent-games .recent-list-items" in browser 0 has "2" elements
  And I expect that element ".player-recent-games .recent-games-table .ReactTable" in browser 0 has the class "recent-games-table-list"
  And I expect that element ".player-recent-games .recent-games-table .rt-th" in browser 0 has "7" elements
  When I click on the button ".recent-more-info-button" in browser 0
  And I wait on element "#invitations" in browser 0 for 5000ms to exist
  When I click on the button "#menu-top .navbar-player" in browser 0
  Then I wait on element "#player-home" in browser 0 for 5000ms to exist
  When I click on the button "#menu-top .navbar-games" in browser 0
  Then I wait on element "#games-board" in browser 0 for 5000ms to exist
