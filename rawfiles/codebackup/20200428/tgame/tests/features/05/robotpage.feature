#@watch
#Feature: Robot page
#
#Scenario: Tgame robot page load success
#  And I wait on element "#all-tutorials" for 5000ms to exist
#  When I click on the button "#all-tutorials .tutorial-video-link"
#  And I wait on element ".modal-video-body" for 5000ms to exist
#  When I click on the button ".modal-video-close-btn"
#  When I pause for 1000ms
#  And I expect that element "#all-tutorials .tutorial-group-content" has "2" elements
#  And I expect that element "#tutorials .tutorial-group-items" has "5" elements
#
#Scenario: Tgame robot page load success - Level 1
#  And I expect that element "#tutorials .tutorial-avatar-1 img" has the class "avatar-1"
#  And I expect that element "#tutorials .tutorial-title-1" contains the text "Your First Game Bot"
#  And I expect that element "#tutorials .tutorial-content-1 .tutorial-content-block" has "3" elements
#  When I click on the button "#tutorials .tutorial-content-1 .tutorial-content-name"
#  And I wait on element "#build-my-AI" for 5000ms to exist
#  When I click on the button ".robot-test-button"
#  When I pause for 5000ms
#  When I click on the button ".robot-beautify-button"
#  When I pause for 1000ms
#  When I click on the button ".robot-allwindow-button"
#  When I pause for 1000ms
#  When I click on the button ".robot-position1-button"
#  When I pause for 1000ms
#  When I click on the button ".robot-position2-button"
#  When I pause for 1000ms
#  When I click on the button ".robot-edit-fullscreen"
#  When I pause for 1000ms
#  When I click on the button ".robot-game-fullscreen"
#  When I pause for 1000ms
#  When I click on the button ".robot-chat-fullscreen"
#  When I pause for 1000ms
#  When I click on the button ".back-to-robot"
#  When I pause for 1000ms
#
#Scenario: Tgame robot page load success - Level 2
#  And I expect that element "#tutorials .tutorial-avatar-2 img" has the class "avatar-2"
#  And I expect that element "#tutorials .tutorial-title-2" contains the text "Understanding Call Shots"
#  And I expect that element "#tutorials .tutorial-content-2 .tutorial-content-block" has "3" elements
#
#Scenario: Tgame robot page load success - Level 3
#  And I expect that element "#tutorials .tutorial-avatar-3 img" has the class "avatar-3"
#  And I expect that element "#tutorials .tutorial-title-3" contains the text "Optimizing Call Shots"
#  And I expect that element "#tutorials .tutorial-content-3 .tutorial-content-block" has "3" elements
#
#Scenario: Tgame robot page load success - Level 4
#  And I expect that element "#tutorials .tutorial-avatar-4 img" has the class "avatar-4"
#  And I expect that element "#tutorials .tutorial-title-4" contains the text "Placing Cue Ball"
#  And I expect that element "#tutorials .tutorial-content-4 .tutorial-content-block" has "3" elements
#
#Scenario: Tgame robot page load success - Level 5
#  And I expect that element "#tutorials .tutorial-avatar-5 img" has the class "avatar-5"
#  And I expect that element "#tutorials .tutorial-title-5" contains the text "Optimize Your Robot"
#  And I expect that element "#tutorials .tutorial-content-5 .tutorial-content-block" has "4" elements
#  When I click on the button "#menu-top .navbar-forum"
#  And I expect the url "https://forum.tgame.ai/" is opened in a new tab
#  When I pause for 1000ms
#  When I click on the button "#menu-top .navbar-account"
#  And I wait on element "#my-account" for 5000ms to exist
