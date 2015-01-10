Router.configure
  # we use the  appBody template to define the layout for the entire app
  layoutTemplate: 'appBody'
  # the appNotFound template is used for unknown routes and missing lists
  notFoundTemplate: 'appNotFound'
  # show the appLoading template whilst the subscriptions below load their data
  #loadingTemplate: 'appLoading',
  # wait on the following subscriptions before rendering the page to ensure
  # the data it's expecting is present
  waitOn: -> [
    Meteor.subscribe 'publicLists'
    Meteor.subscribe 'privateLists'
    Meteor.subscribe 'configurationMaster'
    Meteor.subscribe 'userData'
    Meteor.subscribe 'estates', null
    # @NOTE Portfolio sub. is now done when Estate is set (in NAV.js)
    # Meteor.subscribe 'portfolios', null
    Meteor.subscribe 'buildings', null
    Meteor.subscribe 'leases', null
    Meteor.subscribe 'fluids', null
    Meteor.subscribe 'selectors', null
    Meteor.subscribe 'endUses', null
    Meteor.subscribe 'messages', null
    Meteor.subscribe 'images'
    Meteor.subscribe 'actions'
  ]

@dataReadyHold = null

if Meteor.isClient
  # Keep showing the launch screen on mobile devices until we have loaded
  # the app's data
  dataReadyHold = LaunchScreen.hold()
  requireLogin = ->
    unless Meteor.user()
      @render 'signin'
    else
      @next()
  Router.onBeforeAction requireLogin

Router.map ->
  # Routes that matches their template's name
  routes = [
    'join', 'signin', 'settings', 'portfolios', 'buildings', 'observatory'
    'user', 'fluids', 'selectors', 'scenarioForm', 'timeline'
    'leaseForm', 'actionForm', 'actions-home', 'applyActions'
  ]
  @route route for route in routes

  # Routes with URL that not relies on template's name
  @route 'home', path: '/'
  @route 'insertEstateForm', path: '/estate_form'
  @route 'insertBuildingForm', path: '/building_form'
  @route 'newBuilding', path: '/new_building'
  @route 'treeTplt', path: '/tree'

  # Routes with specific parameters
  @route '/buildings/:_id',
    name: 'buildingDetail'
    data: ->
      curr_building = Buildings.findOne(@params._id)
      # Apparently the router goes several times through the loop
      # We have to catch this annoying behavior, and give it time to let
      # the Data be ready
      return false  unless curr_building
      curr_portfolio = Portfolios.findOne(_id: curr_building.portfolio_id)
      curr_estate = Estates.findOne(portfolio_collection: curr_portfolio._id)
      # Set Session var for Estate & Building
      Session.set 'current_building_doc', curr_building
      Session.set 'current_portfolio_doc', curr_portfolio
      Session.set 'current_estate_doc', curr_estate
      curr_building
