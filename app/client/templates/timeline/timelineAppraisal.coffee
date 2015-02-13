# Local alias on the namespaced variables for the Timeline
TV = TimelineVars

###*
 * Object containing helper keys for the template.
###
Template.timelineAppraisal.helpers
  nbActions: -> TV.actions.length
  totalCost: -> (numeral TV.totalCost).format '0,0[.]00 $'
  triGlobal: -> TAPi18n.__ 'calculating'
  energySaving: -> TAPi18n.__ 'calculating'
