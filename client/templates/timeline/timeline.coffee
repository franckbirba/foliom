# Action bucket is hidden by default
Session.set 'timeline_action_bucket_displayed', false

# @TODO Réservoir d'action en surimpression de l'ensemble de l'écran
# @TODO Légende cachable
# @TODO Tooltips en survol sur les charts
# @TODO Regrouper les actions par leurs noms (c'est un type d'actions)

# Isolate calculated value in a namespace
@TimelineVars =
  scenario: null
  actions: []
  buildings: []
  totalCost: 0
  consumptionChart: null
  planningBudgetChart: null
  minDate: null
  maxDate: null
  timelineActions: []
  timelineLabels: ['S1 2015', 'S2 2015', 'S1 2016', 'S2 2016', 'S1 2017']

Template.timeline.created = ->
  # Reset former state
  TimelineVar = window.TimelineVar
  TimelineVars.totalCost = 0
  TimelineVars.timelineActions = []
  # @TODO fake : Fetch Scenario's data
  # TimelineVars.scenario = Scenarios.findOne _id: scenarioId
  TimelineVars.scenario = Scenarios.findOne()
  # @TODO check for unplanned actions
  # Sort planned actions
  pactions = TimelineVars.scenario.planned_actions
  pactions = _.sortBy pactions, (item) -> (moment item.start).valueOf()
  # Get actions that matches the Ids in the Scenario
  actionIds = _.pluck pactions, 'action_id'
  TimelineVars.actions = (Actions.find  _id: $in: actionIds).fetch()
  # Get each buildings for each actions
  buildingIds = _.pluck TimelineVars.actions, 'building_id'
  TimelineVars.buildings = (Buildings.find _id: $in: buildingIds).fetch()
  # Get all leases for all building, this action is done in a single DB call
  # for avoiding too much latency on the screen's creation
  leases = (Leases.find building_id: $in: buildingIds).fetch()
  # Now dernomalize leases and buildings, re-establishing document object
  # for each building
  for building in TimelineVars.buildings
    building.leases = _.where leases, building_id: building._id
  # Set minimum date on the creation date and maximum date 31 years later
  creationYear = (moment (Session.get 'current_config').creation_date).year()
  TimelineVars.minDate = moment year: creationYear
  TimelineVars.maxDate = moment day: 30, month: 11, year: creationYear + 31
  # Index on the actions table
  currentAction = 0
  # Build formatted data
  quarter = TimelineVars.minDate.clone()
  nextQuarter = quarter.clone()
  nextQuarter.add 1, 'Q'
  while quarter.isBefore TimelineVars.maxDate
    # Parsing each year content
    currentYear = quarter.year()
    yearContent =
      yearValue: currentYear
      quarterContent: []
    while currentYear is quarter.year()
      # Parsing each quarter content
      quarterContent =
        value: quarter.quarter()
        tActions: []
      # Loop through actions utill they aren't in the current quarter
      loop
        # Get out of the loop if all actions have been checked
        break unless TimelineVars.scenario.planned_actions[currentAction]?
        # Get current action date (set in the Scenario)
        date = moment TimelineVars.scenario.planned_actions[currentAction].start
        # Check if current action is contained in the current quarter
        break unless date.isBetween quarter, nextQuarter
        # Denormalize date
        TimelineVars.actions[currentAction].start = date
        # Set the current action in the current quarter
        quarterContent.tActions.push TimelineVars.actions[currentAction]
        # Total costs
        # @FIXME
        TimelineVars.totalCost += 100000
        # Check next action
        currentAction++
      # Group actions in quarter by name
      group = _.groupBy quarterContent.tActions, 'logo'
      quarterContent.tActions = []
      for key, value of group
        quarterContent.tActions.push
          # @TODO Remove ugly hack once logo are ready logo: key
          logo: "&#5888#{Random.choice [0...10]};"
          length: value.length
          action: value
      yearContent.quarterContent.push quarterContent
      # Increment by 1 quarter
      quarter.add 1, 'Q'
      nextQuarter.add 1, 'Q'
    TimelineVars.timelineActions.push yearContent

Template.timeline.helpers
  scenarioName: -> TimelineVars.scenario.name
  availableBuildings: -> TimelineVars.buildings
  nbActions: -> TimelineVars.actions.length
  timelineActions: -> TimelineVars.timelineActions
  totalCost: -> (numeral TimelineVars.totalCost).format '0,0[.]00 $'
  triGlobal: -> TAPi18n.__ 'calculating'
  energySaving: -> TAPi18n.__ 'calculating'
  # Legends are created as simple <table>
  consumptionLegend: -> [
    { color: 'colorA', name:  TAPi18n.__ 'consumption_noaction' }
    { color: 'colorB', name:  TAPi18n.__ 'consumption_action_co2' }
    { color: 'colorC', name:  TAPi18n.__ 'consumption_action_kwh' }
  ]
  planningBudgetLegend: -> [
    { color: 'colorA', name:  TAPi18n.__ 'planning_budget_global' }
    { color: 'colorB', name:  TAPi18n.__ 'planning_budget_investments' }
    { color: 'colorC', name:  TAPi18n.__ 'planning_budget_subventions' }
  ]
  # Action bucket trigger
  isActionBucketDisplayed: -> Session.get 'timeline_action_bucket_displayed'

Template.timeline.rendered = ->
  # Make actions draggable and droppable
  (this.$ '[data-role=\'draggable-action\']').draggable
    cursor: '-webkit-grabbing'
    scrollSensitivity: 100
    scrollSpeed: 100
    containment: 'table.timeline.timeline-year-table'
    revert: 'invalid'
    stop: (e, t) -> console.log 'Drag stopped', @, e, t
  (@$ '[data-role=\'dropable-container\']').droppable
    hoverClass: 'dropable'
    drop: (e, t) -> console.log 'Drop received', @, e, t
  # Create SVG charts with Chartist and attach them to the DOM
  TimelineVar = window.TimelineVars
  TimelineVars.consumptionChart = new Chartist.Line \
    '[data-role=\'consumption-chart\']',
    labels: TimelineVars.timelineLabels
    series: [
      [3, 4, 4.5, 4.7, 5]
      [3, 3.5, 3.2, 3.1, 2]
      [3, 3.5, 4, 4.2, 4.5]
    ]
  , low: 0
  TimelineVars.planningBudgetChart = new Chartist.Line \
    '[data-role=\'budget-planning-chart\']',
    labels: TimelineVars.timelineLabels
    series: [
      [5, 5, 5, 5, 5]
      [0, 1, 2, 4, 4.7]
      [0, .5, 1.2, 2.5, 3.5]
    ]
  , low: 0

Template.timeline.events
  # Change filter on the timeline
  'change [data-trigger=\'timeline-trigger-building-filter\']': (e, t) ->
    console.log 'Selected building', e.currentTarget.value
  # Click on the action bucket
  'click [data-trigger=\'timeline-action-bucket-toggle\']': (e, t) ->
    # Display content of the action bucket
    Session.set 'timeline_action_bucket_displayed', \
      (not Session.get 'timeline_action_bucket_displayed')
    # Change arrow orientation
    t.$ '.action-bucket-arrow-icon'
    .toggleClass 'glyphicon-circle-arrow-up'
    .toggleClass 'glyphicon-circle-arrow-down'
    # Reduce charts sizes and recalculate their SVG content
    t.$ '[data-role=\'consumption-chart\']'
    .toggleClass 'ct-octave'
    .toggleClass 'ct-double-octave'
    TimelineVars.consumptionChart.update()
    t.$ '[data-role=\'budget-planning-chart\']'
    .toggleClass 'ct-octave'
    .toggleClass 'ct-double-octave'
    TimelineVars.planningBudgetChart.update()
