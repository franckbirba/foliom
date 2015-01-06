Template.timeline.helpers
  scenarioId: -> 1
  nbActions: -> 54
  amount: -> numeral(1950000).format '0,0[.]00 $'
  triGlobal: -> TAPi18n.__ 'calculating'
  energySaving: -> TAPi18n.__ 'calculating'

Template.timeline.rendered = ->
  data =
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
    series: [
      [5, 2, 4, 2, 0]
    ]
  new Chartist.Line '#consumption.ct-chart', data
  new Chartist.Line '#planning_budget.ct-chart', data
