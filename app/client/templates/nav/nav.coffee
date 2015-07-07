Template.nav.created = ->
  # Subscribe to roles
  Meteor.subscribe 'roles', null
  # Subscribe to the correct configurations
  @autorun =>
    # ESTATES
    Meteor.subscribe 'estates', Meteor.user()._id, Roles.userIsInRole(Meteor.user()._id, ['admin'])

    currentEstate = Session.get 'current_estate_doc'
    if !currentEstate?
      # If there is only one Estate: select it
      if Estates.find().fetch().length is 1
        Session.set 'current_estate_doc', Estates.findOne()
    else
      estate_doc_id = currentEstate._id
      # CONFIGURATIONS
      #Subscribe to the Estate config
      Meteor.subscribe 'configurations', estate_doc_id
      #Also set a Session var
      curr_config = Configurations.findOne master: false
      Session.set 'current_config', curr_config  if curr_config
      # PORTFOLIOS (only subscribe if at least one Portfolio exists)
      if currentEstate.hasOwnProperty("portfolio_collection")
        Meteor.subscribe 'portfolios', currentEstate.portfolio_collection, Roles.userIsInRole(Meteor.user()._id, ['admin'])
        if Portfolios.find().count() > 0
          # BUILDINGS
          Meteor.subscribe 'buildings', currentEstate.portfolio_collection
          # LEASES
          all_buildings_ids = Buildings.find({},{fields: {'_id':1}}).map( (b)->
            return b._id )
          Meteor.subscribe 'leases', all_buildings_ids
      # SCENARIOS
      Meteor.subscribe 'scenarios', estate_doc_id
      # SELECTORS
      Meteor.subscribe 'selectors', estate_doc_id
      # MESSAGES
      Meteor.subscribe 'messages', estate_doc_id
      # ACTIONS
      Meteor.subscribe 'actions', estate_doc_id

Template.nav.events
  'click .js-logout': ->
    Meteor.logout()
    Router.go 'signin'
  'click #login-buttons-logout': ->
    Meteor.logout()
    Router.go 'signin'
  'click .en-lang': -> setLanguage 'en'
  'click .fr-lang': -> setLanguage 'fr'
  'click .select_estate': ->
    est = Estates.findOne(_id: @_id)
    Session.set 'current_estate_doc', est
    Session.set 'current_portfolio_doc', undefined
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
  # estates: -> Estates.find().fetch()
  username: -> Meteor.user() and Meteor.user().emails.shift().address
  lang: -> TAPi18n.getLanguage()
  langActiv: (lang) ->
    return 'active' if TAPi18n.getLanguage() is lang
    ''

Template.nav.rendered = ->
  # If the user is an Admin and has no Estate selected: display modal
  @autorun ->
    if Roles.userIsInRole(Meteor.user()._id, ['admin']) and \
        not Session.get('current_estate_doc')?
      $('#SelectEstateForm').modal 'show'

Template.nav.destroyed = ->
  Session.set('current_estate_doc', undefined)
