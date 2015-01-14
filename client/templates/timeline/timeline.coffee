# Action bucket is hidden by default
Session.set 'timeline_action_bucket_displayed', false

# @TODO Fake data
buildings = [
  { _id: 1, building_name: 'Building 1' }
  { _id: 2, building_name: 'Building 2' }
  { _id: 3, building_name: 'Building 3' }
]
# Actions are sorted by start date
actions = [
  {
    _id: 1
    logo: '&#58880;'
    name: 'Nouveaux compteurs'
    start: moment().subtract(1, 'M').toDate()
    duration: 36
    costs: [150000]
    buildingIds: [1]
  }
  {
    _id: 2
    logo: '&#58881;'
    name: 'Etanchéïté'
    start: new Date
    duration: 30
    costs: [200000, 200000]
    buildingIds: [1, 2]
  }
  {
    _id: 3
    logo: '&#58882;'
    name: 'Double vitrage'
    start: moment().add(1, 'y').toDate()
    duration: 4
    costs: [300000]
    buildingIds: [1]
  }
  {
    _id: 4
    logo: '&#58883;'
    name: 'Etanchéïté sol'
    start: moment().add(1, 'y').toDate()
    duration: 12
    costs: [100000, 100000]
    buildingIds: [1, 2]
  }
  {
    _id: 5
    logo: '&#58884;'
    name: 'Etanchéïté plafond'
    start: moment().add(1, 'y').add(1, 'M').toDate()
    duration: 168
    costs: [100000]
    buildingIds: [2]
  }
]

nbActions = totalCost = 0
minDate = maxDate = null
timelineActions = []

Template.timeline.created = ->
  # Reset former state
  nbActions = totalCost = 0
  minDate = maxDate = moment actions?[0].start
  timelineActions = []
  # Iterate over current selected scenarios for preparing all calculations
  for action in actions
    # Number of actions as detailes in the appraisal
    nbActions += action.buildingIds.length
    # Total costs
    totalCost += cost for cost in action.costs
    # Get begining of actions
    mStart = moment action.start
    minDate = moment.min minDate, moment action.start
    # Get end of actions
    maxDate = moment.max maxDate, mStart.add action.duration, 'M'
  # Build formatted data
  quarter = moment year: minDate.year(), month: (minDate.quarter() * 3) - 1
  while quarter.isBefore maxDate
    currentYear = quarter.year()
    yearContent =
      yearValue: currentYear
      quarterContent: []
    dummy1 = _.findWhere actions, _id: 4
    dummy2 = _.findWhere actions, _id: 1
    while currentYear is quarter.year()
      yearContent.quarterContent.push
        value: quarter.quarter()
        actions: [dummy1, dummy2]



      # Increment by 1 quarter
      quarter.add 1, 'Q'
    timelineActions.push yearContent
  console.log timelineActions



Template.timeline.helpers
  scenarioId: -> 1
  availableBuildings: ->
    buildingIdInActions = _.uniq (_.flatten (_.pluck actions, 'buildingIds'))
    availableBuildings = []
    for id in buildingIdInActions
      availableBuildings.push _.findWhere buildings, _id: id
    availableBuildings
  nbActions: -> nbActions
  timelineActions: -> timelineActions
  totalCost: -> (numeral totalCost).format '0,0[.]00 $'
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
  ($ '[data-role=\'draggable-action\']').draggable()
  ($ '[data-role=\'dropable-container\']').draggable()
  # Create SVG charts with Chartist and attach them to the DOM
  timeline = ['S1 2015', 'S2 2015', 'S1 2016', 'S2 2016', 'S1 2017']
  consumptionData =
    labels: timeline
    series: [
      [3, 4, 4.5, 4.7, 5]
      [3, 3.5, 3.2, 3.1, 2]
      [3, 3.5, 4, 4.2, 4.5]
    ]
  planningBudgetData =
    labels: timeline
    series: [
      [5, 5, 5, 5, 5]
      [0, 1, 2, 4, 4.7]
      [0, .5, 1.2, 2.5, 3.5]
    ]
  new Chartist.Line '[data-role=\'consumption-chart\']', \
    consumptionData, low: 0
  new Chartist.Line '[data-role=\'budget-planning-chart\']', \
    planningBudgetData, low: 0

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
    $ '.action-bucket-arrow-logo'
    .toggleClass 'glyphlogo-circle-arrow-up'
    .toggleClass 'glyphlogo-circle-arrow-down'
    # Reduce chart's sizes
    $ '[data-role=\'consumption-chart\']'
    .toggleClass 'ct-octave'
    .toggleClass 'ct-double-octave'
    $ '[data-role=\'budget-planning-chart\']'
    .toggleClass 'ct-octave'
    .toggleClass 'ct-double-octave'
