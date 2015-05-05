# Local alias on the namespaced variables for the Timeline
TV = TimelineVars

###*
 * Object containing helper keys for the template.
###
Template.timelineAppraisal.helpers
  nbActions: -> TV.scenario.planned_actions.length
  totalCost: -> "#{(numeral TV.totalCost).format '0,0[.]00'} €"
  triGlobal: -> TV.rxTriGlobal.get()
  energySaving: -> TAPi18n.__ 'calculating'
  waterSaving: -> TAPi18n.__ 'calculating'
  co2Saving: -> TV.rxCo2Emission.get()
  budgetSaving: -> TAPi18n.__ 'calculating'
