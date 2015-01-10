MENU_KEY = 'menuOpen'
Session.setDefault MENU_KEY, false
USER_MENU_KEY = 'userMenuOpen'
Session.setDefault USER_MENU_KEY, false
SHOW_CONNECTION_ISSUE_KEY = 'showConnectionIssue'
Session.setDefault SHOW_CONNECTION_ISSUE_KEY, false
CONNECTION_ISSUE_TIMEOUT = 5000

Meteor.startup ->
  # set up a swipe left / right handler
  $(document.body).touchwipe
    wipeLeft: -> Session.set MENU_KEY, false
    wipeRight: -> Session.set MENU_KEY, true
    preventDefaultEvents: false
  # Only show the connection error box if it has been 5 seconds since
  # the app started
  setTimeout ->
    # Show the connection error box
    Session.set SHOW_CONNECTION_ISSUE_KEY, true
  , CONNECTION_ISSUE_TIMEOUT

Template.appBody.helpers
  # We use #each on an array of one item so that the "list" template is
  # removed and a new copy is added when changing lists, which is
  # important for animation purposes. #each looks at the _id property of it's
  # items to know when to insert a new item and when to update an old one.
  thisArray: -> [this]
  menuOpen: -> Session.get(MENU_KEY) and 'menu-open'
  cordova: -> Meteor.isCordova and 'cordova'
  emailLocalPart: ->
    email = Meteor.user().emails[0].address
    email.substring 0, email.indexOf("@")
  userMenuOpen: -> Session.get USER_MENU_KEY
  lists: -> Lists.find()
  activeListClass: ->
    current = Router.current()
    'active' if current.route.name is 'listsShow' and current.params._id is @_id
  connected: ->
    if Session.get(SHOW_CONNECTION_ISSUE_KEY)
      Meteor.status().connected
    else
      true

Template.appBody.events
  'click .js-menu': -> Session.set MENU_KEY, not Session.get(MENU_KEY)

  'click .content-overlay': (event) ->
    Session.set MENU_KEY, false
    event.preventDefault()

  'click .js-user-menu': (event) ->
    Session.set USER_MENU_KEY, not Session.get(USER_MENU_KEY)
    # stop the menu from closing
    event.stopImmediatePropagation()

  'click #menu a': -> Session.set MENU_KEY, false

  'click .js-logout': ->
    Meteor.logout()
    Router.go 'signin'

  'click .js-new-list': ->
    list =
      name: Lists.defaultName()
      incompleteCount: 0
    list._id = Lists.insert(list)
    Router.go 'listsShow', list
