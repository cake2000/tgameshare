@watch
Feature: Home page

Scenario: Tgame home page load success - TuringGame
  And I expect that the title is "TuringGame" in browser 0
  And I expect that element ".brand img" in browser 0 has the class "tgame-logo"
  And I expect that element "#menu-top nav" in browser 0 has the class "menu-top-navbar"

#Scenario: Tgame home page load success - Features
#  And I expect that element "#features h2.hero-heading " contains the text "FEATURES"
#  And I expect that element "#features .features-section__block" has "3" elements
#
#Scenario: Tgame home page load success - Games
#  And I expect that element "#games h2.title " contains the text "GAMES"
#  And I expect that element "#games img" has the class "game-icon"
#  And I expect that element "#games h1.heading " contains the text "Trajectory Pool"
#  And I expect that element "#games div.text " contains the text "Pool game with ball trajectory preview and random shot skews"

#Scenario: Tgame home page load success - Learning
#  Given I open the site "/player"
#  And I wait on element "#player-home" for 5000ms to exist
