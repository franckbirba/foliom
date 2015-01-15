# Action bucket is hidden by default
Session.set 'timeline_action_bucket_displayed', false

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
  scenarioId = "q6tuMFTuHpkrPu6XS"
  TimelineVars.scenario = Scenarios.findOne _id: scenarioId
  actionIds = _.pluck TimelineVars.scenario.planned_actions, 'action_id'
  TimelineVars.actions = (Actions.find \
    { _id: $in: actionIds },
    { sort: start: -1 }
  ).fetch()
  buildingIds = _.pluck TimelineVars.actions, 'building_id'
  TimelineVars.buildings = (Buildings.find _id: $in: buildingIds).fetch()
  # Set minimum date on the creation date and maximum date 31 years later
  creationYear = (moment (Session.get 'current_config').creation_date).year()
  TimelineVars.minDate = moment year: creationYear
  TimelineVars.maxDate = moment day: 30, month: 11, year: creationYear + 31
  # Iterate over current selected scenarios for preparing all calculations
  for action in TimelineVars.actions
    # Total costs
    # @FIXME
    TimelineVars.totalCost += 1000000
  # Build formatted data
  quarter = TimelineVars.minDate.clone()
  while quarter.isBefore TimelineVars.maxDate
    currentYear = quarter.year()
    yearContent =
      yearValue: currentYear
      quarterContent: []
    dummy1 = _.findWhere TimelineVars.actions, _id: 4
    dummy2 = _.findWhere TimelineVars.actions, _id: 1
    while currentYear is quarter.year()
      yearContent.quarterContent.push
        value: quarter.quarter()
        actions: [dummy1, dummy2]
        # @TODO PEM Carry on



      # Increment by 1 quarter
      quarter.add 1, 'Q'
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
  (@$ '[data-role=\'draggable-action\']').draggable
    cursor: '-webkit-grabbing'
    scrollSensitivity: 100
    scrollSpeed: 100
    # @TODO à vérfier avec BSE axis: 'y'
    containment: 'table.timeline.timeline-year-table'
    revert: 'invalid'
    # @TODO à vérfier avec BSE snap: 'td[data-role=\'dropable-container\']'
    # @TODO à vérfier avec BSE grid: [20, 44]
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
