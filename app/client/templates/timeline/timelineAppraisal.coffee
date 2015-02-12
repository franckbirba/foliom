###*
 * Object containing helper keys for the template.
###
Template.timelineAppraisal.helpers
  nbActions: -> TimelineVars.actions.length
  totalCost: -> (numeral TimelineVars.totalCost).format '0,0[.]00 $'
  triGlobal: -> TAPi18n.__ 'calculating'
  energySaving: -> TAPi18n.__ 'calculating'
