Template.signin.created = ->
  Session.set 'signinErrors', {}
  # Determine language's preferences based on browser's settings
  language = window.navigator.userLanguage || window.navigator.language
  # If language isn't french, set it to english
  language = 'en' unless language is 'fr'
  setLanguage language

Template.signin.helpers
  errorMessages: -> _.values (Session.get 'signinErrors')
  errorClass: (key) -> (Session.get 'signinErrors')[key] and 'error'

Template.signin.events
  submit: (e, t) ->
    e.preventDefault()
    email = (t.$ '[name=email]').val()
    password = (t.$ '[name=password]').val()
    errors = {}
    errors.email = TAPi18n.__ 'email_required'  unless email
    errors.password = TAPi18n.__ 'password_required'  unless password
    Session.set 'signinErrors', errors
    return  if _.keys(errors).length
    Meteor.loginWithPassword email, password, (error) ->
      return Session.set 'signinErrors', none: error.reason if error
      setLanguage Meteor.user().profile.lang
      Router.go 'home', Meteor.user
