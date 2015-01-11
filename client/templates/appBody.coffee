MENU_KEY = 'menuOpen'
Session.setDefault MENU_KEY, false
USER_MENU_KEY = 'userMenuOpen'
Session.setDefault USER_MENU_KEY, false
SHOW_CONNECTION_ISSUE_KEY = 'showConnectionIssue'
Session.setDefault SHOW_CONNECTION_ISSUE_KEY, false
CONNECTION_ISSUE_TIMEOUT = 5000

Meteor.startup ->
  # Only show the connection error box if it has been 5 seconds since
  # the app started
  setTimeout ->
    # Show the connection error box
    Session.set SHOW_CONNECTION_ISSUE_KEY, true
  , CONNECTION_ISSUE_TIMEOUT

Template.appBody.helpers
  connected: ->
    if Session.get(SHOW_CONNECTION_ISSUE_KEY)
      Meteor.status().connected
    else
      true

Template.appBody.events
  'click .js-menu': -> Session.set MENU_KEY, not Session.get(MENU_KEY)

  'click #menu a': -> Session.set MENU_KEY, false

  'click .js-logout': ->
    Meteor.logout()
    Router.go 'signin'
