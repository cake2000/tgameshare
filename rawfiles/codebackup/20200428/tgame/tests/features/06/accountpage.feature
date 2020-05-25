#@watch
#Feature: Account page
#
#Scenario: Tgame account page load success - Account Info
#  And I expect that element "#my-account .info-group" has "2" elements
#  And I expect that element "#my-account .account-title" contains the text "Account Info"
#  And I expect that element "#my-account .account-content-group div" has the class "account-content"
#  When I click on the button "#my-account .account-content-group .btn"
#  And I wait on element "#account-plans" for 1000ms to exist
#  When I click on the button ".modal__header--close"
#
#Scenario: Tgame account page load success - Basic Info
#  And I expect that element "#my-account .basic-title" contains the text "Basic Info"
#  And I expect that element "#my-account .basic-image-group div" has the class "image-changer"
#  And I expect that element "#my-account .basic-info-content .basic-content-line" has "7" elements
#  When I click on the button "#my-account .basic-info-content .basic-info__title .edit-account-button"
#  And I wait on element ".form--editbasic" for 1000ms to exist
#  When I click on the button "#my-account .basic-info-content .btn-transparent"
#  When I pause for 1000ms
#  When I click on the button "#my-account .basic-info-content .change-password-button"
#  And I wait on element ".change-pw-modal" for 1000ms to exist
#  When I click on the button ".modal__header--close"
#  When I pause for 1000ms
#
