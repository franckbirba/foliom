# Wait on the following subscriptions before rendering the page to ensure
# the data it's expecting is present
basicWaitOn = -> [
  Meteor.subscribe 'configurationMaster'
  Meteor.subscribe 'userData'
  Meteor.subscribe 'estates', null
  # @NOTE Portfolio sub. is now done when Estate is set (in nav.coffee)
  # Meteor.subscribe 'portfolios', null
  Meteor.subscribe 'buildings', null
  Meteor.subscribe 'leases', null
  Meteor.subscribe 'fluids', null
  Meteor.subscribe 'endUses', null
  Meteor.subscribe 'messages', null
  Meteor.subscribe 'images'
  Meteor.subscribe 'actions'
  # @NOTE Portfolio sub. is now done when Estate is set (in nav.coffee)
  # Meteor.subscribe 'scenarios'
]

Router.configure
  # we use the  appBody template to define the layout for the entire app
  layoutTemplate: 'appBody'
  # the appNotFound template is used for unknown routes and missing lists
  notFoundTemplate: 'appNotFound'
  # show the appLoading template whilst the subscriptions below load their data
  loadingTemplate: 'appLoading'
  waitOn: basicWaitOn

  # configuration for iron-router-progress
  # progressDelay : 100


if Meteor.isClient
  Router.onBeforeAction ->
    Log.info "Routing: #{@url}"
    return @render 'signin' unless Meteor.user()
    @next()

Router.map ->
  # Routes that matches their template's name
  routes = [
    'join', 'signin', 'settings', 'portfolios',
    'user', 'selectors', 'scenarioForm_old', 'scenarioList', 'leaseForm',
    'about', 'help', 'termOfUse'
    # Buildings
    'buildings', 'building-new', 'building-form'
    # Estates
    'estatesList', 'estate-form'
    # Actions
    'action-form', 'actions-home', 'actions-apply', 'actions-list'
    'test'
  ]
  @route route for route in routes

  # Routes with URL that not relies on template's name
  @route 'home', path: '/'
  @route 'treeTplt', path: '/tree'

  # Routes with specific parameters
  @route '/observatory',
    name: 'observatory'
    data: ->
      # GET BUILDING LIST (for the Estate, ie. all Portfolios in the Estate)
      buildings = _.chain(Session.get('current_estate_doc').portfolio_collection)
                      .map ((portfolio_id) ->
                        Buildings.find({ portfolio_id: portfolio_id }).fetch()
                      )
                      .flatten()
                      .value()
      return {
        buildings: buildings
      }


  @route '/buildings/:_id',
    name: 'building-detail'
    data: ->
      return false  unless @params._id
      curr_building = Buildings.findOne @params._id
      # Apparently the router goes several times through the loop
      # We have to catch this annoying behavior, and give it time to let
      # the Data be ready
      return false  unless curr_building
      curr_portfolio = Portfolios.findOne curr_building.portfolio_id
      curr_estate = Estates.findOne portfolio_collection: curr_portfolio._id
      # Set Session var for Estate & Building
      Session.set 'current_building_doc', curr_building
      Session.set 'current_portfolio_doc', curr_portfolio
      Session.set 'current_estate_doc', curr_estate
      curr_building

  @route '/scenario-form/:_id?',
    name: 'scenario-form'
    data: ->
      # GET BUILDING LIST (for the Estate, ie. all Portfolios in the Estate)
      buildings = _.chain(Session.get('current_estate_doc').portfolio_collection)
                      .map ((portfolio_id) ->
                        Buildings.find({ portfolio_id: portfolio_id }).fetch()
                      )
                      .flatten()
                      .value()
      buildingIds = _.pluck buildings, '_id'
      # GET ALL RELEVANT ACTIONS
      action_list = actions = []
      for building in buildings
        # Get all child Actions for this Building
        actions = Actions.find({
          'action_type': 'child'
          'building_id': building._id
        }, sort: name: 1).fetch()
        # Go through all Actions and push them to the planned_actions array
        # Note: heavy design - we have to respect the format needed by the Timeline, but we also need to denormalize the Action to have easier filtering for the criterions
        # Thus, the Action data is present two times. But has the advantage of always having a clean Action copy
        for action in actions
          action_clone = clone action # avoid circular ref.
          action.start = moment()
          action.criterion_priority = {}
          action.action = action_clone
          action_list.push action
          # action_list.push
          #   'action': action
          #   'start': moment() # Add start date (today)
      # Get each portfolios for each buildings
      portfolioIds = Session.get('current_estate_doc').portfolio_collection
      portfolios = (Portfolios.find _id: $in: portfolioIds).fetch()
      # Get all leases for all building, this action is done in a single DB
      # call for avoiding too much latency on the screen's creation
      leases = (Leases.find building_id: $in: buildingIds).fetch()
      # Now dernomalize leases and buildings, re-establishing document object
      # for each building
      for building in buildings
        building.leases = _.where leases, building_id: building._id

      curr_scenario = {}
      if @params._id is undefined
        Log.info '/scenario-form route has been called with a null param'
        curr_scenario =
          "name": "",
          "duration": "",
          "total_expenditure": ""
          "roi_less_than": ""
          "criterion_list": []
          "estate_id": Session.get('current_estate_doc')._id
          "planned_actions": []
          "logo": ""
      else
        curr_scenario = Scenarios.findOne @params._id
        Log.info "/scenario-form route got data for scenario #{@params._id}"
        # Create a simple array of all Actions (makes denormalization easier)
        actions = _.map action_list, (item) ->
          return item.action
        # Denormalize actions in the scenario and transform start date as moment
        for paction in curr_scenario.planned_actions
          paction.action = _.findWhere actions, _id: paction.action_id
          paction.start = moment paction.start unless paction.start is null

      # Apparently the router goes several times through the loop
      # We have to catch this annoying behavior, and give it time to let
      # the Data be ready
      # unless curr_scenario
      #   Log.info "/scenario-form route can't find scenario #{@params._id}"
      #   return false

      return {
          scenario: curr_scenario
          buildings: buildings
          portfolios: portfolios
          action_list: action_list
        }

  @route '/timeline/:_id',
    name: 'timeline'
    data: ->
      try
        throw new Meteor.Error 'route', 'param is null' if @params._id is undefined
        # Get the current selected scenario
        scenario = Scenarios.findOne @params._id
        throw new Meteor.Error 'route', 'no scenario' unless scenario
        # Get actions that matches the Ids in the Scenario
        pactions = scenario.planned_actions
        throw new Meteor.Error 'route', 'no planned actions' unless pactions
        actionIds = _.pluck pactions, 'action_id'
        actions = (Actions.find  _id: $in: actionIds).fetch()
        # Denormalize actions in the scenario and transform start date as moment
        for paction in pactions
          paction.action = _.findWhere actions, _id: paction.action_id
          paction.start = moment paction.start unless paction.start is null
        # Get each buildings for each actions
        buildingIds = _.uniq _.pluck actions, 'building_id'
        buildings = (Buildings.find _id: $in: buildingIds).fetch()
        # Get each portfolios for each buildings
        portfolioIds = _.uniq _.pluck buildings, 'portfolio_id'
        portfolios = (Portfolios.find _id: $in: portfolioIds).fetch()
        # Get all leases for all building, this action is done in a single DB
        # call for avoiding too much latency on the screen's creation
        leases = (Leases.find building_id: $in: buildingIds).fetch()
        # Now dernomalize leases and buildings, re-establishing document object
        # for each building
        for building in buildings
          building.leases = _.where leases, building_id: building._id
        # Return the denormalized data for the scenario, the buildings
        #  and the portfolios
        return {
          scenario: scenario
          buildings: buildings
          portfolios: portfolios
        }
      catch err
        Log.error "/timeline route error: #{err.message}"
        return false
