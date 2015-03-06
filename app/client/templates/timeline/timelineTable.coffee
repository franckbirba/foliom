# Local alias on the namespaced variables for the Timeline
TV = TimelineVars

Template.timelineTable.created = ->
  # Reset filtering on portfolio or building: take all the buildings
  Session.set 'timeline-filter-portfolio-or-building', \
    _.pluck TV.buildings, '_id'

###*
 * Object containing helper keys for the template.
###
Template.timelineTable.helpers
  availablePortfolios: -> TV.portfolios
  availableBuildings: -> TV.buildings
  timelineActions: -> TV.rxTimelineActions.get()

###*
 * Object containing event actions for the template.
###
Template.timelineTable.events
  'dragstart [data-role=\'draggable-action\']': (e, t) -> actionDragged e, t
  # Drop actions in the timeline
  'drop [data-role=\'dropable-container\']': (e, t) -> actionItemDropped e, t
  # Change filter on the timeline
  'change [data-trigger=\'timeline-trigger-estate-building-filter\']': (e, t) ->
    # Check selected filtering
    if e.currentTarget.value is 'all'
      # No filtering, get all buildings used for the current scenario
      buildingFilter = _.pluck TV.buildings, '_id'
    else
      # Filtering can be on portfolio or on building
      filterObj = JSON.parse e.currentTarget.value
      if filterObj.building_id?
        # Filter is on a single building
        buildingFilter = [filterObj.building_id]
      else
        # Filter is on a portfolio, get all buildings that match it
        buildingFilter = _.pluck (
          _.where TV.buildings, { portfolio_id: filterObj.portfolio_id }
        ), '_id'
    Session.set 'timeline-filter-portfolio-or-building', buildingFilter

Template.timelineTable.rendered = ->
  # Set estate and building filter as a select2
  Meteor.setTimeout ->
    (@$ '[data-trigger=\'timeline-trigger-estate-building-filter\']').select2()
  , 0
  # Make actions containers droppable
  (@$ '[data-role=\'dropable-container\']').droppable hoverClass: 'dropable'
  # Apply draggable each time the reactive actions are changed
  @autorun ->
    # Get reactive var that may require to update dragging
    TimelineVars.rxTimelineActions.dep.depend()
    # Make actions draggable once rendered
    Meteor.setTimeout ->
      ($ '[data-role=\'draggable-action\']').draggable
        helper: 'clone'
        cursor: '-webkit-grabbing'
        scrollSensitivity: 100
        scrollSpeed: 100
        containment: 'table.timeline.timeline-year-table'
        revert: 'invalid'
    , 0

###*
 * Save dragged object for retrieval once dropped.
 * @param {Object} e    jQuery event.
 * @param {Object} t    Template's instance.
###
actionDragged = (e, t) ->
  e.stopPropagation()
  TV.dragged = t.$ e.target

###*
 * Handle acion's dropped in the Timeline table.
 * @param {Object} e    jQuery event.
 * @param {Object} t    Template's instance.
###
actionItemDropped = (e, t) ->
  e.stopPropagation()
  $quarter = t.$ e.target
  $actions = TV.dragged
  # Check if action is from the timeline or from the action bucket
  unless ($actions.attr 'data-role') is 'draggable-action'
    # Action is from the action bucket
    actionIds = [$actions.attr 'data-value']
  else
    # Action is from the timeline table
    actionIds = ($actions.attr 'data-value').split(';')
  # Modify action's start
  quarterObj = JSON.parse $quarter.attr 'data-value'
  pactions = TV.scenario.planned_actions
  for actionId in actionIds
    idx = _.indexOf pactions,(_.findWhere pactions,{action_id:actionId})
    pactions[idx].start = moment
      second: 1 # @NOTE: A second is added so that inBetween evaluation works
      month: (quarterObj.Q - 1) * 3
      year: quarterObj.Y
  # Update DB
  formattedActions = _.map pactions, (paction) ->
    action_id: paction.action_id
    start: paction.start.toDate()
    efficiency_ratio: paction.efficiency_ratio
  # console.table formattedActions
  Scenarios.update {_id: TV.scenario._id}, $set:planned_actions:formattedActions
