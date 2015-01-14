# Action bucket is hidden by default
Session.set 'timeline_action_bucket_displayed', false

# @TODO Fake data
buildings = [
  {
    id: 1
    name: 'Building 1'
  }
  {
    id: 2
    name: 'Building 2'
  }
  {
    id: 3
    name: 'Building 3'
  }
]

actions = [
  {
    icon: '&#58880;'
    name: 'Nouveaux compteurs'
    start: new Date
    duration: 36
    costs: [150000]
    buildingIds: [1]
  }
  {
    icon: '&#58881;'
    name: 'Etanchéïté'
    start: moment(new Date).subtract(1, 'M').toDate()
    duration: 30
    costs: [200000, 200000]
    buildingIds: [1, 2]
  }
  {
    icon: '&#58882;'
    name: 'Double vitrage'
    start: moment(new Date).add(1, 'y').toDate()
    duration: 4
    costs: [300000]
    buildingIds: [1]
  }
  {
    icon: '&#58883;'
    name: 'Etanchéïté sol'
    start: moment(new Date).add(1, 'y').toDate()
    duration: 12
    costs: [100000, 100000]
    buildingIds: [1, 2]
  }
  {
    icon: '&#58884;'
    name: 'Etanchéïté plafond'
    start: moment(new Date).add(1, 'y').add(1, 'M').toDate()
    duration: 8
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
  quarter = minDate.clone()
  while quarter.isBefore maxDate
    timelineActions.push
      quarterLabel: "T#{quarter.quarter()} - #{quarter.year()}"
    # Increment by 1 quarter
    quarter.add 1, 'Q'
  console.log 'minDate', minDate.toString()
  console.log 'maxDate', maxDate.toString()
  console.log 'quarter', quarter.toString()
  console.log 'timelineActions', timelineActions







Template.timeline.helpers
  scenarioId: -> 1
  availableBuildings: ->
    [].push {id: id, name: (_.findWhere buildings, id: id).name} for id in \
      _.uniq (_.flatten (_.pluck actions, 'buildingIds'))
  nbActions: -> nbActions
  timelineActions: -> timelineActions
  totalCost: -> (numeral totalCost).format '0,0[.]00 $'
  triGlobal: -> TAPi18n.__ 'calculating'
  energySaving: -> TAPi18n.__ 'calculating'
  # Legends are created as simple <table>
  consumptionLegend: -> [
    {
      round: "background-color: #{CHARTIST_COLORS[0]};"
      style: "color: #{CHARTIST_COLORS[0]};"
      name:  TAPi18n.__ 'consumption_noaction'
    }
    {
      round: "background-color: #{CHARTIST_COLORS[1]};"
      style: "color: #{CHARTIST_COLORS[1]};"
      name:  TAPi18n.__ 'consumption_action_co2'
    }
    {
      round: "background-color: #{CHARTIST_COLORS[2]};"
      style: "color: #{CHARTIST_COLORS[2]};"
      name:  TAPi18n.__ 'consumption_action_kwh'
    }
  ]
  planningBudgetLegend: -> [
    {
      round: "background-color: #{CHARTIST_COLORS[0]};"
      style: "color: #{CHARTIST_COLORS[0]};"
      name:  TAPi18n.__ 'planning_budget_global'
    }
    {
      round: "background-color: #{CHARTIST_COLORS[1]};"
      style: "color: #{CHARTIST_COLORS[1]};"
      name:  TAPi18n.__ 'planning_budget_investments'
    }
    {
      round: "background-color: #{CHARTIST_COLORS[2]};"
      style: "color: #{CHARTIST_COLORS[2]};"
      name:  TAPi18n.__ 'planning_budget_subventions'
    }
  ]
  # Action bucket trigger
  isActionBucketDisplayed: -> Session.get 'timeline_action_bucket_displayed'

Template.timeline.rendered = ->
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
  new Chartist.Line '#consumption.ct-chart', consumptionData
  new Chartist.Line '#planning_budget.ct-chart', planningBudgetData

Template.timeline.events
  'click [data-trigger=\'timeline-action-bucket-toggle\']': (e, t) ->
    # Display content of the action bucket
    Session.set 'timeline_action_bucket_displayed', \
      (not Session.get 'timeline_action_bucket_displayed')
    # Change arrow orientation
    $ '.action-bucket-arrow-icon'
    .toggleClass 'glyphicon-circle-arrow-up'
    .toggleClass 'glyphicon-circle-arrow-down'
