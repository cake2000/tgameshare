@watch
Feature: Signin page

Scenario: Tgame sign in load success
  Given I open the site "/signin" in browser 0
  When I add "ai@mail.com" for ".signin-email" element in browser 0
  When I add "123456789" for ".signin-password" element in browser 0
  When I click on the button ".signin-submit" in browser 0
  And I wait on element "#player-home" in browser 0 for 5000ms to exist
  When I click on the button ".brand" in browser 0
  When I pause for 2000ms in browser 0
