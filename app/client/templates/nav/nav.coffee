Template.nav.created = ->
  # Subscribe for the correct configurations
  @autorun ->
    currentEstate = Session.get 'current_estate_doc'
    if currentEstate?
      estate_doc_id = currentEstate._id
      # CONFIGURATIONS
      #Subscribe to the Estate config
      Meteor.subscribe 'configurations', estate_doc_id
      #Also set a Session var
      curr_config = Configurations.findOne master: false
      Session.set 'current_config', curr_config  if curr_config
      #PORTFOLIOS
      Meteor.subscribe 'portfolios', estate_doc_id
      #SCENARIOS
      Meteor.subscribe 'scenarios', estate_doc_id
      # Empty the current Portfolio doc
      #Session.set 'current_portfolio_doc', undefined

Template.nav.events
  'click .js-logout': ->
    Meteor.logout()
    Router.go 'signin'
  'click #login-buttons-logout': ->
    Meteor.logout()
    Router.go 'signin'
  'click .en-lang': -> setLanguage 'en'
  'click .fr-lang': -> setLanguage 'fr'
  'click .select_estate': -> #??
    est = Estates.findOne(_id: @_id)
    Session.set 'current_estate_doc', est
    Session.set 'editingMasterCfg', false

Template.nav.helpers
  currentEstate: ->
    estate = Session.get 'current_estate_doc'
    if estate then estate.estate_name else 'Estates'
  isAdminEstate: ->
    estate = Session.get 'current_estate_doc'
    estate is -1
  activPage: (menuEntry) ->
    current = document.URL.split('/').pop()
    return 'active' if current is menuEntry
    ''
  activEstate: (estate_id) ->
    if Session.get('current_estate_doc')?._id is estate_id then 'active' else ''
  estates: -> Estates.find().fetch()
  username: -> Meteor.user() and Meteor.user().emails.shift().address
  lang: -> TAPi18n.getLanguage()
  langActiv: (lang) ->
    return 'active' if TAPi18n.getLanguage() is lang
    ''

Template.nav.rendered = ->
  if Meteor.user().roles.indexOf('admin') >= 0 and \
    not Session.get('current_estate_doc')?
      # If there is only one Estate: select it
      if Estates.find().fetch().length is 1
        Session.set 'current_estate_doc', Estates.findOne()
      else
        $('#SelectEstateForm').modal 'show'
