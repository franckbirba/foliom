# Local alias on the namespaced variables for the Timeline
TV = TimelineVars

###*
 * Object containing helper keys for the template.
###
Template.timelineAppraisal.helpers
  nbActions: -> TV.scenario.planned_actions.length
  totalCost: -> "#{(numeral TV.totalCost).format '0,0[.]00'} €"
  triGlobal: -> TV.triGlobal
  energySaving: -> (numeral TV.kwhSpare).format '0.00'
  waterSaving: -> (numeral TV.waterSpare).format '0.00'
  co2Saving: -> (numeral TV.co2Spare).format '0.00'
  budgetSaving: -> (numeral TV.invoiceSpare).format '0.00'
