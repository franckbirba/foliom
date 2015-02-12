###*
 * Object containing helper keys for the template.
###
Template.timelineTable.helpers
  availablePortfolios: -> TimelineVars.portfolios
  availableBuildings: -> TimelineVars.buildings
  timelineActions: -> TimelineVars.timelineActions

###*
 * Object containing event actions for the template.
###
Template.timelineTable.events
  # Drop actions in the timeline
  'drop [data-role=\'dropable-container\']': (e, t) -> actionItemDropped e, t
  # Change filter on the timeline
  'change [data-trigger=\'timeline-trigger-estate-building-filter\']': (e, t) ->
    console.log 'Selected building', e.currentTarget.value

Template.timelineTable.rendered = ->
  # Set estate and building filter as a select2
  (@$ '[data-trigger=\'timeline-trigger-estate-building-filter\']').select2()
  # Make actions draggable and droppable
  (this.$ '[data-role=\'draggable-action\']').draggable
    cursor: '-webkit-grabbing'
    scrollSensitivity: 100
    scrollSpeed: 100
    containment: 'table.timeline.timeline-year-table'
    revert: 'invalid'
  (@$ '[data-role=\'dropable-container\']').droppable hoverClass: 'dropable'

###*
 * Handle acion's dropped in the Timeline.
 * @param {Object} e    jQuery event.
 * @param {Object} t    Template's instance.
###
actionItemDropped = (e, t) ->
  tv = TimelineVars
  console.log e
  $quarter = $ e.target
  $actions = $ e.toElement
  # Check if action is from the timeline or from the action bucket
  unless ($actions.attr 'data-role') is 'draggable-action'
    # From bucket we only receive the TD instead of the TR
    $actions = $actions.closest 'tr'
    # Action is from the action bucket
    console.log 'action is from bucket', $actions
    actionsObj = [JSON.parse $actions.attr 'data-value']
  else
    # Action is from the timeline
    # Adjust DOM
    #$newActions = $actions.clone()
    #$newActions.attr 'style', 'position: relative;'
    #$newActions.draggable
    #  cursor: '-webkit-grabbing'
    #  scrollSensitivity: 100
    #  scrollSpeed: 100
    #  containment: 'table.timeline.timeline-year-table'
    #  revert: 'invalid'
    #$quarter.append $newActions
    #$actions.remove()
    actionsObj = JSON.parse $actions.attr 'data-value'
  console.log 'Modyfying actions', actionsObj
  # Modify action's start
  quarterObj = JSON.parse $quarter.attr 'data-value'
  pactions = tv.scenario.planned_actions
  for action in actionsObj
    idx = _.indexOf pactions,(_.findWhere pactions,{action_id:action.action_id})
    pactions[idx].start = (moment
      second: 1 # @NOTE: A second is added so that inBetween evaluation works
      month: (quarterObj.Q - 1) * 3
      year: quarterObj.Y).toDate()
  # Recalculate
  tv.calculate()
  # Update DB
  Scenarios.update {_id: tv.scenario._id}, $set: planned_actions: pactions
  # Refresh charts
  for chart in ['consumptionChart', 'expenseChart', 'investmentChart']
    tv[chart].update tv["#{chart}Data"]()
  # Refresh display based on actions
  tv.rxActions.set tv.actions
  tv.rxTimelineActions.set tv.timelineActions
