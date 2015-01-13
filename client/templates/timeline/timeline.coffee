# Action bucket is hidden by default
Session.set 'timeline_action_bucket_displayed', false

# @TODO Fake data
actions = [
  {
    icon: '&#58880;'
    description: 'Nouveaux compteurs'
    start: 'Tue Jan 13 2015 17:47:19 GMT+0100 (CET)'
    # Action duration is provided as years
    duration: 3
    price: 150000
  }
  {
    icon: '&#58881;'
    description: 'Etanchéïté'
    start: 'Tue Jan 13 2015 17:47:19 GMT+0100 (CET)'
    # Action duration is provided as years
    duration: 2.5
    price: 200000
  }
  {
    icon: '&#58882;'
    description: 'Double vitrage'
    start: 'Tue Jan 13 2015 17:47:19 GMT+0100 (CET)'
    # Action duration is provided as years
    duration: 1.5
    price: 300000
  }
  {
    icon: '&#58883;'
    description: 'Etanchéïté sol'
    start: 'Wed Jan 13 2016 17:50:29 GMT+0100 (CET)'
    # Action duration is provided as years
    duration: 2.5
    price: 100000
  }
  {
    icon: '&#58884;'
    description: 'Etanchéïté plafond'
    start: 'Wed Jul 13 2016 17:50:29 GMT+0200 (CEST)'
    # Action duration is provided as years
    duration: 2.5
    price: 100000
  }
]

Template.timeline.helpers
  scenarioId: -> 1
  nbActions: -> actions.length
  actions: -> actions
  amount: -> numeral(1950000).format '0,0[.]00 $'
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
