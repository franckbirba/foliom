# @TODO Planned action vs unplanned actions
# @TODO Filters on buildings

# Action bucket is hidden by default
Session.set 'timeline-action-bucket-displayed', false
# Isolate calculated value in a namespace
@TimelineVars =
  scenario: null
  actions: []
  buildings: []
  totalCost: 0
  consumptionChart: null
  expenseChart: null
  investmentChart: null
  toolTips: {}
  minDate: null
  maxDate: null
  timelineActions: []
  charts: {}

###*
 * Prepare calculation at template creation.
###
Template.timeline.created = ->
  # Reset action bucket's display when entering screen
  Session.set 'timeline-action-bucket-displayed', false
  # Reset action bucket filters
  Session.set 'timeline-filter-actions', 'all'
  # Reset former state
  TimelineVar = window.TimelineVar
  TimelineVars.totalCost = 0
  TimelineVars.timelineActions = []
  # @TODO fake : Fetch Scenario's data
  # TimelineVars.scenario = Scenarios.findOne _id: scenarioId
  TimelineVars.scenario = Scenarios.findOne()
  # @TODO check for unplanned actions
  # Get actions that matches the Ids in the Scenario
  pactions = TimelineVars.scenario.planned_actions
  actionIds = _.pluck pactions, 'action_id'
  TimelineVars.actions = (Actions.find  _id: $in: actionIds).fetch()
  # Get each buildings for each actions
  buildingIds = _.uniq _.pluck TimelineVars.actions, 'building_id'
  TimelineVars.buildings = (Buildings.find _id: $in: buildingIds).fetch()
  # Get each portfolios for each buildings
  portfolioIds = _.uniq _.pluck TimelineVars.buildings, 'portfolio_id'
  TimelineVars.portfolios = (Portfolios.find _id: $in: portfolioIds).fetch()
  # Get all leases for all building, this action is done in a single DB call
  # for avoiding too much latency on the screen's creation
  leases = (Leases.find building_id: $in: buildingIds).fetch()
  # Now dernomalize leases and buildings, re-establishing document object
  # for each building
  for building in TimelineVars.buildings
    building.leases = _.where leases, building_id: building._id
  # Set minimum date on the creation date and maximum date 31 years later
  creationYear = (moment (Session.get 'current_config').creation_date).year()
  TimelineVars.minDate = moment year: creationYear
  TimelineVars.maxDate = moment day: 30, month: 11, year: creationYear + 31
  # Perform calculations
  timelineCalctulate TimelineVars

###*
 * Object containing helper keys for the template.
###
Template.timeline.helpers
  scenarioName: -> TimelineVars.scenario.name
  availablePortfolios: -> TimelineVars.portfolios
  availableBuildings: -> TimelineVars.buildings
  nbActions: -> TimelineVars.actions.length
  timelineActions: -> TimelineVars.timelineActions
  totalCost: -> (numeral TimelineVars.totalCost).format '0,0[.]00 $'
  triGlobal: -> TAPi18n.__ 'calculating'
  energySaving: -> TAPi18n.__ 'calculating'
  # Action bucket trigger
  isActionBucketDisplayed: -> Session.get 'timeline-action-bucket-displayed'
  # Action bucket's exports as table
  actionBucketTableHeadings: -> [
    TAPi18n.__ 'quarter'
    TAPi18n.__ 'action_type'
    TAPi18n.__ 'building'
    '€'
    "#{TAPi18n.__ 'efficiency'} (%)"
    "#{TAPi18n.__ 'efficiency'} (kWh)"
    'TRI'
  ]
  actionBucketTableBody: ->
    filter = Session.get 'timeline-filter-actions'
    switch filter
      when 'planned'
        _.filter TimelineVars.actions, (action) -> action.start?
      when 'unplanned'
        _.filter TimelineVars.actions, (action) -> action.start is undefined
      else TimelineVars.actions

###*
 * Ends rendering actions when template is rendered.
###
Template.timeline.rendered = ->
  # Set estate and building filter as a select2
  (@$ '[data-trigger=\'timeline-trigger-estate-building-filter\']').select2()
  # Make actions draggable and droppable
  (this.$ '[data-role=\'draggable-action\']').draggable
    cursor: '-webkit-grabbing'
    scrollSensitivity: 100
    scrollSpeed: 100
    containment: 'table.timeline.timeline-year-table'
    revert: 'invalid'
  (@$ '[data-role=\'dropable-container\']').droppable
    hoverClass: 'dropable', drop: actionItemDropped

###*
 * Object containing event actions for the template.
###
Template.timeline.events
  # Change filter on the timeline
  'change [data-trigger=\'timeline-trigger-estate-building-filter\']': (e, t) ->
    console.log 'Selected building', e.currentTarget.value
  # Change filter on action bucket
  'click [data-role=\'filter-actions\']': (e, t) ->
    $btnGroup = t.$ '[data-role=\'filter-actions\']'
    $selected = $ e.target
    value = $selected.attr 'data-value'
    unless value is undefined
      $btnGroup.children().removeClass 'active'
      $selected.addClass 'active'
      Session.set 'timeline-filter-actions', $selected.attr 'data-value'
  # Click on the action bucket
  'click [data-trigger=\'timeline-action-bucket-toggle\']': (e, t) ->
    showHideActionBucket()
  # Click on action bucket items for quarter modification
  'click .quarter-select': (e, t) ->
    console.log 'Modify current selected quarter', e, t
    (t.$ e.currentTarget).toggleClass 'quarter-selected'

###*
 * Show or hide the action bucket.
###
showHideActionBucket = ->
  $actionBucket = $ '.action-bucket'
  # Display content of the action bucket
  isDisplayed = Session.get 'timeline-action-bucket-displayed'
  if isDisplayed
    # Toggle translation and wait for its end for
    # removing action's bucket content
    $actionBucket
    .removeClass 'action-bucket-displayed'
    .on TRANSITION_END_EVENT, ->
      Session.set 'timeline-action-bucket-displayed', false
  else
    # Add action's bucket content before toggling animation
    Session.set 'timeline-action-bucket-displayed', true
    $actionBucket
    .off TRANSITION_END_EVENT
    .addClass 'action-bucket-displayed'
    # @NOTE Reactivity triggers DOM insertion, thus setting the state of the
    #  button's group must wait so that all elements are inserted. The same
    #  goes for attaching the draggable properties to the action's rows.
    Meteor.setTimeout ->
      # Set the appropriate filter button
      $btnGroup = $actionBucket.find '[data-role=\'filter-actions\']'
      $btnGroup.children().removeClass 'active'
      $selected = $btnGroup.find \
        "[data-value=\'#{Session.get 'timeline-filter-actions'}\']"
      $selected.addClass 'active'
      # @TODO Set row as draggable
      ($ '[data-role=\'draggable-action-bucket\']').draggable \
        cursor: '-webkit-grabbing'
        scrollSensitivity: 100
        scrollSpeed: 100
        #containment: 'table.timeline.timeline-year-table'
        revert: 'invalid'
    , 0
  # Change arrow orientation
  $actionBucket.find '.action-bucket-arrow-icon'
  .toggleClass 'glyphicon-circle-arrow-up'
  .toggleClass 'glyphicon-circle-arrow-down'

###*
 * Perform all calculations and fill the global TimelineVars object.
 * @param {Object} tv The global TimelineVars object.
###
timelineCalctulate = (tv) ->
  # Sort planned actions
  tv.scenario.planned_actions = _.sortBy tv.scenario.planned_actions, (item) ->
    (moment item.start).valueOf()
  # Reset charts that doesn't depends on actions
  tv.charts = { ticks: [], budget: [], consumption: [] }
  # Index on the actions table
  currentAction = 0
  # Build formatted data
  quarter = tv.minDate.clone()
  nextQuarter = quarter.clone().add 1, 'Q'
  while quarter.isBefore tv.maxDate
    # Parsing each year content
    currentYear = quarter.year()
    yearContent =
      yearValue: currentYear
      quarterContent: []
    while currentYear is quarter.year()
      # Parsing each quarter content
      quarterContent =
        value: quarter.quarter()
        quarterValue: JSON.stringify Q: quarter.quarter(), Y:currentYear
        tActions: []
      # Loop through actions utill they aren't in the current quarter
      loop
        # Get out of the loop if all actions have been checked
        break unless tv.scenario.planned_actions[currentAction]?
        # Get current action date (set in the Scenario)
        date = moment tv.scenario.planned_actions[currentAction].start
        # Check if current action is contained in the current quarter
        break unless date.isBetween quarter, nextQuarter
        # Set the current action in the current quarter
        quarterContent.tActions.push tv.actions[currentAction]
        # Total costs
        tv.totalCost += tv.actions[currentAction].investment.cost
        # Check next action
        currentAction++
      # Group actions in quarter by name
      group = _.groupBy quarterContent.tActions, 'logo'
      quarterContent.tActions = []
      for key, value of group
        item =
          logo: key
          length: value.length
          buildingsToActions: JSON.stringify(for action in value
            building_id: action.building_id
            action_id: action._id
          )
        quarterContent.tActions.push item
      # Budget line for chart
      tv.charts.budget.push tv.scenario.total_expenditure
      # Labels for charts
      tv.charts.ticks.push \
        "#{TAPi18n.__ 'quarter_abbreviation'}#{quarter.format 'Q YYYY'}"
      # Current consumption for charts
      # @TODO Fake data
      tv.charts.consumption.push 3.5
      # Set year in the timeline
      yearContent.quarterContent.push quarterContent
      # Increment by 1 quarter
      quarter.add 1, 'Q'
      nextQuarter.add 1, 'Q'
    tv.timelineActions.push yearContent
  # Generate suites for each action
  for action, idx in tv.actions
    # Denormalize date
    action.start = moment tv.scenario.planned_actions[idx].start
    action.quarter = \
      "#{TAPi18n.__ 'quarter_abbreviation'}#{action.start.format 'Q YYYY'}"
    # Denormalize building's name and portfolio's id
    building = _.findWhere tv.buildings, _id: action.building_id
    action.buildingName = building.building_name
    action.portfolioId = building.portfolio_id
    # Denormalize and format cost
    action.formattedCost = (numeral action.investment.cost).format '0,0[.]00 $'
    # Prepare triggering dates
    action.endDesign = action.start.clone().add action.design_duration, 'M'
    action.endWork = action.endDesign.clone().add action.works_duration, 'M'
    action.end = action.endWork.clone().add action.action_lifetime, 'Y'
    action.investmentSuite = []
    action.investmentSubventionedSuite = []
    action.consumptionCo2ModifierSuite = []
    action.consumptionKwhModifierSuite = []
    # Iterate over the scenario duration
    quarter = tv.minDate.clone()
    nextQuarter = quarter.clone().add 1, 'Q'
    investment = 0
    investmentSubventioned = 0
    consumptionCo2Modifier = 0
    consumptionKwhModifier = 0
    while quarter.isBefore tv.maxDate
      if action.start.isBetween quarter, nextQuarter
        investment = action.investment.cost
        investmentSubventioned = action.subventions.residual_cost
      if action.endWork.isBetween quarter, nextQuarter
        # @TODO Fake modifiers
        consumptionCo2Modifier = -.5
        consumptionKwhModifier = -1
      action.investmentSuite.push investment
      action.investmentSubventionedSuite.push investmentSubventioned
      action.consumptionCo2ModifierSuite.push consumptionCo2Modifier
      action.consumptionKwhModifierSuite.push consumptionKwhModifier
      # Increment by 1 quarter
      quarter.add 1, 'Q'
      nextQuarter.add 1, 'Q'

###*
 * Handle acion's dropped in the Timeline.
 * @param {Object} e    jQuery event.
 * @param {Object} t    Template's instance.
###
actionItemDropped = (e, t) ->
  tv = TimelineVars
  $quarter = $ @
  $actions = t.draggable
  # Adjust DOM
  $newActions = $actions.clone()
  $newActions.attr 'style', 'position: relative;'
  $newActions.draggable
    cursor: '-webkit-grabbing'
    scrollSensitivity: 100
    scrollSpeed: 100
    containment: 'table.timeline.timeline-year-table'
    revert: 'invalid'
  $quarter.append $newActions
  $actions.remove()
  # Modify action's start
  quarterObj = JSON.parse $quarter.attr 'data-value'
  actionsObj = JSON.parse $newActions.attr 'data-value'
  pactions = tv.scenario.planned_actions
  for action in actionsObj
    idx = _.indexOf pactions,(_.findWhere pactions,{action_id:action.action_id})
    pactions[idx].start = (moment
      second: 1 # @NOTE: A second is added so that inBetween evaluation works
      month: (quarterObj.Q - 1) * 3
      year: quarterObj.Y).toDate()
  # Recalculate
  timelineCalctulate tv
  # Update DB
  Scenarios.update {_id: tv.scenario._id}, $set: planned_actions: pactions
  # Refresh charts
  for chart in ['consumptionChart', 'expenseChart', 'investmentChart']
    tv[chart].update tv["#{chart}Data"]()
  # Refresh table by hiding it if displayed
  showHideActionBucket() if Session.get 'timeline-action-bucket-displayed', true
