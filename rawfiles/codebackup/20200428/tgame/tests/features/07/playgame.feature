@watch
Feature: Play game

Scenario: Player logout successfully
  When I click on the button "#menu-top .navbar-logout" in browser 0

Scenario: TestAI0 login successfully
  Given TestAI0 open the site "/signin" in browser 0
  Given TestAI1 open the site "/signin" in browser 1
  When TestAI0 add "testai0@mail.com" for ".signin-email" element in browser 0
  When TestAI0 add "123456789" for ".signin-password" element in browser 0
  When TestAI0 click on the button ".signin-submit" in browser 0
  And TestAI0 wait on element "#player-home" in browser 0 for 5000ms to exist
  Given Record initial coins of "TestAI0"

Scenario: TestAI0 enter game room successfully
  When TestAI0 click on the button "#menu-top .navbar-games" in browser 0
  And TestAI0 wait on element "#select-game" in browser 0 for 5000ms to exist
  When TestAI0 click on the button "#select-game .game__info__image:nth-child(1)" in browser 0
  And TestAI0 wait on element "#game-mode" in browser 0 for 5000ms to exist
  When TestAI0 click on the button ".game-mode-playernetwork" in browser 0
  And TestAI0 wait on element "#difficulty" in browser 0 for 1000ms to exist
  When TestAI0 click on the button "#difficulty .level--wrapper:nth-child(1)" in browser 0
  And TestAI0 wait on element ".page--gamesroom" in browser 0 for 5000ms to exist

Scenario: TestAI1 login successfully
  When TestAI1 add "testai1@mail.com" for ".signin-email" element in browser 1
  When TestAI1 add "123456789" for ".signin-password" element in browser 1
  When TestAI1 click on the button ".signin-submit" in browser 1
  And TestAI1 wait on element "#player-home" in browser 1 for 5000ms to exist
  Given Record initial coins of "TestAI1"

Scenario: TestAI0 invite TestAI1 successfully
  When TestAI0 click on the button ".button--accept" in browser 0
  And TestAI0 wait on element ".player--invite--wrapper" in browser 0 for 5000ms to exist
  When TestAI0 click on the button ".invite--wrapper:nth-child(1) .invite--info__content" in browser 0
  And TestAI1 wait on element "#noti-dropdown" in browser 1 for 5000ms to exist

Scenario: TestAI1 accept successfully
  When TestAI1 click on the button ".noti-item:nth-child(1) .noti-item__btn--accept" in browser 1
  And TestAI1 wait on element ".page--gamesroom" in browser 1 for 5000ms to exist

Scenario: TestAI0 and TestAI1 chat with each other successfully
  When TestAI1 add "Hello" for ".chatHistoryAction--textarea" element in browser 1
  And TestAI1 click on the button ".tg-icon-paper-plane" in browser 1
  And TestAI0 wait until 2000ms in browser 0
  Then TestAI0 expect that element ".chatHistory__List__Item:nth-child(2) .you" in browser 0 contains the text "Hello"
  When TestAI0 add "Hi" for ".chatHistoryAction--textarea" element in browser 0
  And TestAI0 click on the button ".tg-icon-paper-plane" in browser 0
  And TestAI1 wait until 2000ms in browser 1
  Then TestAI1 expect that element ".chatHistory__List__Item:nth-child(3) .you" in browser 1 contains the text "Hi"

Scenario: TestAI0 start game successfully
  When TestAI1 click on the button ".button--startgame:nth-child(1)" in browser 1
  And TestAI0 wait on element ".player--info__ready" in browser 0 for 5000ms to exist
  When TestAI0 click on the button ".button--startgame" in browser 0
  Then TestAI0 wait until 5000ms in browser 0
  And TestAI0 wait on element ".gameWrapper" in browser 0 for 10000ms to exist
  Then TestAI0 wait until 20000ms in browser 0

Scenario: TestAI1 quit game successfully
  When TestAI1 open the site "/player" in browser 1
  And TestAI1 expect that a alertbox in browser 1 is opened
  Then TestAI1 accept the alertbox in browser 1
  And TestAI0 wait on element "#difficulty" in browser 0 for 10000ms to exist
  And I expect that "TestAI1" lost the game, decreased 25 coins and "TestAI0" won the game, increased 25 coins

Scenario: Player buy item
  Given Record initial coins of "TestAI0"
  When TestAI0 click on the button "#menu-top .navbar-player" in browser 0
  And TestAI0 wait on element ".player-change-item-button" in browser 0 for 10000ms to exist
  When TestAI0 click on the button ".player-change-item-button" in browser 0
  And TestAI0 wait on element ".upgrade-item-wrapper" in browser 0 for 5000ms to exist
  When TestAI0 click on the button ".upgrade-item:nth-child(2) .btn-unlock" in browser 0
  Then TestAI0 wait on element ".message" in browser 0 for 500ms to exist
  When TestAI0 click on the button ".upgrade-item:nth-child(2) .actions button" in browser 0
  Then TestAI0 wait on element ".upgrade-item:nth-child(2) .btn-equip" in browser 0 for 5000ms to exist
  And TestAI0 click on the button ".upgrade-item:nth-child(2) .btn-equip" in browser 0
  And I expect that "TestAI0" bought item successfully
  When TestAI0 click on the button ".modal__header--close" in browser 0
  And TestAI0 wait on element "#player-home" in browser 0 for 5000ms to exist

Scenario: Practice Myself
  When TestAI0 open the site "/gamesBoard" in browser 0
  And TestAI0 expect that a alertbox in browser 0 is opened
  Then TestAI0 accept the alertbox in browser 0
  And TestAI0 wait on element "#select-game .game__info__image" in browser 0 for 10000ms to exist
  When TestAI0 click on the button "#select-game .game__info__image:nth-child(1)" in browser 0
  And TestAI0 wait on element "#game-mode" in browser 0 for 5000ms to exist
  When TestAI0 click on the button ".game-mode-myself" in browser 0
  And TestAI0 wait on element "#difficulty" in browser 0 for 5000ms to exist
  When TestAI0 click on the button "#difficulty .level--wrapper:nth-child(1)" in browser 0
  And TestAI0 wait on element ".page--gamesroom" in browser 0 for 5000ms to exist
  When TestAI0 click on the button "#player1-radio" in browser 0
  And TestAI0 wait on element ".selection--wrapper" in browser 0 for 3000ms to exist
  When TestAI0 click on the button "#player2-radio" in browser 0
  And TestAI0 wait on element ".selection--wrapper" in browser 0 for 3000ms to exist
  When TestAI0 click on the button ".page--gamesroom .item-info .change-item-button" in browser 0
  And TestAI0 wait on element ".upgrade-item-wrapper" in browser 0 for 5000ms to exist
  And TestAI0 TestAI1 expect that element ".upgrade-item:nth-child(2) .equiped-item" in browser 0 contains the text "Equipped"
  When TestAI0 click on the button ".modal__header--close" in browser 0
  And TestAI0 wait on element ".page--gamesroom" in browser 0 for 5000ms to exist
  When TestAI0 click on the button ".button--startgame" in browser 0
  Then TestAI0 wait until 5000ms in browser 0
  And TestAI0 wait on element ".gameWrapper" in browser 0 for 10000ms to exist
  Then TestAI0 wait until 20000ms in browser 0
  Given TestAI0 open the site "/player" in browser 0
  And TestAI0 wait on element "#player-home" in browser 0 for 5000ms to exist

Scenario: Go to Robot page successfully
  When TestAI0 click on the button "#menu-top .navbar-robot" in browser 0
  And TestAI0 wait on element "#select-game .game__info__image" or "#all-tutorials .tutorialQuiz" in browser 0 for 10000ms to exist

Scenario: User has not determined his skill levels
  Given TestAI0 expects that element "#all-tutorials .tutorialQuiz" exist on the page in browser 0
  When TestAI0 click on the button ".tutorialQuiz--body__answers--element:nth-child(1) input" in browser 0
  When TestAI0 click on the button ".tutorialQuiz--footer__button" in browser 0
  And TestAI0 wait on element "#select-game .game__info__image" in browser 0 for 10000ms to exist

Scenario: User has already determined his skill levels
  Given TestAI0 expects that element "#select-game .game__info__image" exist on the page in browser 0
  When TestAI0 click on the button "#select-game .game__info__image:nth-child(1)" in browser 0
  And TestAI0 wait on element "#all-tutorials .tg-tutorial__group--block" in browser 0 for 10000ms to exist

Scenario: Test user's code successfully
  When TestAI0 click on the button ".tutorial-content-name:nth-child(1) span" in browser 0
  And TestAI0 wait on element ".gameWrapper" in browser 0 for 10000ms to exist
  When TestAI0 click on the button "#chatHistoryAction .sendChatButton:nth-child(3)" in browser 0
  And TestAI0 wait until 5000ms in browser 0
  Then TestAI0 expect that element ".chatHistory__List__Item:nth-last-child(1)" in browser 0 does not have the class "USER_TEXT"
  When TestAI0 click on the button "#chatHistoryAction .sendChatButton:nth-child(3)" in browser 0
  And TestAI0 wait until 5000ms in browser 0
  Then TestAI0 expect that element ".chatHistory__List__Item:nth-last-child(1)" in browser 0 does not have the class "USER_TEXT"
  When TestAI0 click on the button ".robot-test-button" in browser 0
  And TestAI0 wait until 15000ms in browser 0
  Then TestAI0 expect that element ".chatHistory__List__Item:nth-last-child(1)" in browser 0 does not have the class "USER_TEXT REVEAL_ELEMENT"


