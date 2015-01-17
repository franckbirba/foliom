# @TODO Planned action vs unplanned actions
# @TODO Filters on buildings

# Action bucket is hidden by default
Session.set 'timeline_action_bucket_displayed', false

DRAGGABLE_PROPERTIES =
  cursor: '-webkit-grabbing'
  scrollSensitivity: 100
  scrollSpeed: 100
  containment: 'table.timeline.timeline-year-table'
  revert: 'invalid'

# Isolate calculated value in a namespace
@TimelineVars =
  scenario: null
  actions: []
  buildings: []
  totalCost: 0
  consumptionChart: null
  planningBudgetChart: null
  minDate: null
  maxDate: null
  timelineActions: []
  charts:
    ticks: []
    budget: []

Template.timeline.created = ->
  # Reset former state
  TimelineVar = window.TimelineVar
  TimelineVars.totalCost = 0
  TimelineVars.timelineActions = []
  TimelineVars.charts.ticks = []
  TimelineVars.charts.budget = []
  # @TODO fake : Fetch Scenario's data
  # TimelineVars.scenario = Scenarios.findOne _id: scenarioId
  TimelineVars.scenario = Scenarios.findOne()
  # @TODO check for unplanned actions
  # Get actions that matches the Ids in the Scenario
  pactions = TimelineVars.scenario.planned_actions
  actionIds = _.pluck pactions, 'action_id'
  TimelineVars.actions = (Actions.find  _id: $in: actionIds).fetch()
  # Get each buildings for each actions
  buildingIds = _.pluck TimelineVars.actions, 'building_id'
  TimelineVars.buildings = (Buildings.find _id: $in: buildingIds).fetch()
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

Template.timeline.helpers
  scenarioName: -> TimelineVars.scenario.name
  availableBuildings: -> TimelineVars.buildings
  nbActions: -> TimelineVars.actions.length
  timelineActions: -> TimelineVars.timelineActions
  totalCost: -> (numeral TimelineVars.totalCost).format '0,0[.]00 $'
  triGlobal: -> TAPi18n.__ 'calculating'
  energySaving: -> TAPi18n.__ 'calculating'
  # Legends are created as simple <table>
  consumptionLegend: -> [
    { color: 'colorA', name: TAPi18n.__ 'consumption_noaction' }
    { color: 'colorB', name: TAPi18n.__ 'consumption_action_co2' }
    { color: 'colorC', name: TAPi18n.__ 'consumption_action_kwh' }
  ]
  planningBudgetLegend: -> [
    { color: 'colorA', name: TAPi18n.__ 'planning_budget_global' }
    { color: 'colorB', name: TAPi18n.__ 'planning_budget_investments' }
    { color: 'colorC', name: TAPi18n.__ 'planning_budget_subventions' }
  ]
  # Action bucket trigger
  isActionBucketDisplayed: -> Session.get 'timeline_action_bucket_displayed'
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
  actionBucketTableBody: -> TimelineVars.actions

Template.timeline.rendered = ->
  # Reset action bucket's display when entering screen
  Session.set 'timeline_action_bucket_displayed', false
  # Make actions draggable and droppable
  (this.$ '[data-role=\'draggable-action\']').draggable DRAGGABLE_PROPERTIES
  (@$ '[data-role=\'dropable-container\']').droppable
    hoverClass: 'dropable', drop: actionItemDropped
  # Create SVG charts with Chartist and attach them to the DOM
  tv = window.TimelineVars
  chartistProperties =
    low: 0
    lineSmooth: false
    showPoint: true
    axisX: showLabel: false, showGrid: false
  tv.consumptionChart = new Chartist.Line \
    '[data-chart=\'consumptionChart\']'
  , getConsumptionChartData()
  , chartistProperties
  tv.planningBudgetChart = new Chartist.Line \
    '[data-chart=\'planningBudgetChart\']'
  , getPlanningBudgetChartData()
  , chartistProperties
  # Add tooltips to the charts
  tv.toolTips = {}
  addToolTip 'consumptionChart'
  addToolTip 'planningBudgetChart'

Template.timeline.events
  # Change filter on the timeline
  'change [data-trigger=\'timeline-trigger-building-filter\']': (e, t) ->
    console.log 'Selected building', e.currentTarget.value
  # Click on the action bucket
  'click [data-trigger=\'timeline-action-bucket-toggle\']': (e, t) ->
    # Toggle translation
    t.$ '.action-bucket'
    .toggleClass 'action-bucket-displayed'
    # Display content of the action bucket
    Session.set 'timeline_action_bucket_displayed', \
      (not Session.get 'timeline_action_bucket_displayed')
    # Change arrow orientation
    t.$ '.action-bucket-arrow-icon'
    .toggleClass 'glyphicon-circle-arrow-up'
    .toggleClass 'glyphicon-circle-arrow-down'
  # Click on a hide/show legend
  'click [data-trigger=\'hideshow-legend\']': (e, t) ->
    button = t.$ e.target
    chartValue = button.attr 'data-value'
    widget = t.$ "[data-role='#{chartValue}']"
    chart = widget.find '[data-role=\'chart\']'
    legend = widget.find '[data-role=\'legend\']'
    if button.hasClass 'glyphicon-eye-close'
      legend.hide()
    else
      legend.show()
    (chart.toggleClass 'col-md-8').toggleClass 'col-md-11'
    (chart.children().toggleClass 'ct-octave').toggleClass 'ct-major-twelfth'
    TimelineVars[chartValue].update()
    (button.toggleClass 'glyphicon-eye-close').toggleClass 'glyphicon-eye-open'

timelineCalctulate = (tv) ->
  # Sort planned actions
  tv.scenario.planned_actions = _.sortBy tv.scenario.planned_actions, (item) ->
    (moment item.start).valueOf()
  tv.charts.ticks = []
  tv.charts.budget = []
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
          # @TODO Remove ugly hack once logo are ready logo: key
          # logo: "&#5888#{Random.choice [0...10]};"
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
      yearContent.quarterContent.push quarterContent
      # Increment by 1 quarter
      quarter.add 1, 'Q'
      nextQuarter.add 1, 'Q'
    tv.timelineActions.push yearContent
  # Generate suites for each action
  for action, idx in tv.actions
    action.start = moment tv.scenario.planned_actions[idx].start
    # Prepare triggering dates
    action.endDesign = action.start.clone().add action.design_duration, 'M'
    action.endWork = action.endDesign.clone().add action.works_duration, 'M'
    action.end = action.endWork.clone().add action.action_lifetime, 'Y'
    action.investmentSuite = []
    action.investmentSubventionedSuite = []
    # Iterate over the scenario duration
    quarter = tv.minDate.clone()
    nextQuarter = quarter.clone().add 1, 'Q'
    investment = 0
    investmentSubventioned = 0
    while quarter.isBefore tv.maxDate
      if action.start.isBetween quarter, nextQuarter
        investment = action.investment.cost
        investmentSubventioned = action.subventions.residual_cost
      action.investmentSuite.push investment
      action.investmentSubventionedSuite.push investmentSubventioned
      # Increment by 1 quarter
      quarter.add 1, 'Q'
      nextQuarter.add 1, 'Q'

createArrayFilledWithZero = (size) ->
  (Array.apply null, new Array size).map Number.prototype.valueOf, 0

sumSuite = (arr, key) ->
  results = createArrayFilledWithZero arr[0][key].length
  for idx in [0...results.length]
    for item in arr
      results[idx] += item[key][idx]
  results

actionItemDropped = (e, t, what) ->
  $quarter = $ @
  $actions = t.draggable
  # Adjust DOM
  $newActions = $actions.clone()
  $newActions.attr 'style', 'position: relative;'
  $newActions.draggable DRAGGABLE_PROPERTIES
  $quarter.append $newActions
  $actions.remove()
  # Modify action's start
  quarterObj = JSON.parse $quarter.attr 'data-value'
  actionsObj = JSON.parse $newActions.attr 'data-value'
  pactions = TimelineVars.scenario.planned_actions
  for action in actionsObj
    idx = _.indexOf pactions,(_.findWhere pactions,{action_id:action.action_id})
    pactions[idx].start = (moment
      second: 1 # @NOTE: A second is added so that inBetween evaluation works
      month: (quarterObj.Q - 1) * 3
      year: quarterObj.Y).toDate()
  # Recalculate
  timelineCalctulate TimelineVars
  # Update DB
  Scenarios.update {_id: TimelineVars.scenario._id},
    $set: planned_actions: pactions
  # Refresh charts
  TimelineVars.consumptionChart.update getConsumptionChartData()
  TimelineVars.planningBudgetChart.update getPlanningBudgetChartData()
  # @TODO Refresh table

getConsumptionChartData = ->
  labels: TimelineVars.charts.ticks
  series: [
    {
      name: TAPi18n.__ 'consumption_noaction'
      data: [3, 4, 4.5, 4.7, 5]
    }
    {
      name: TAPi18n.__ 'consumption_action_co2'
      data: [3, 3.5, 3.2, 3.1, 2]
    }
    {
      name: TAPi18n.__ 'consumption_action_kwh'
      data: [3, 3.5, 4, 4.2, 4.5]
    }
  ]

getPlanningBudgetChartData = ->
  labels: TimelineVars.charts.ticks
  series: [
    {
      name: TAPi18n.__ 'planning_budget_global'
      data: TimelineVars.charts.budget
    }
    {
      name: TAPi18n.__ 'planning_budget_investments'
      data: sumSuite TimelineVars.actions, 'investmentSuite'
    }
    {
      name: TAPi18n.__ 'planning_budget_subventions'
      data: sumSuite TimelineVars.actions, 'investmentSubventionedSuite'
    }
  ]

easeOutQuad = (x, t, b, c, d) ->
  -c * (t /= d) * (t - 2) + b

addToolTip = (dataChart) ->
  $chart = $ "[data-chart='#{dataChart}']"
  TimelineVars.toolTips[dataChart] = $chart
    .append '<div class="tooltip"></div>'
    .find '.tooltip'
    .hide()
  $chart.on 'mouseenter', '.ct-point', ->
    $point = $ @
    value = $point.attr 'ct:value'
    seriesName = $point.parent().attr 'ct:series-name'
    $point.animate {'stroke-width': '20px'}, 100, easeOutQuad
    (TimelineVars.toolTips[dataChart].html "#{seriesName}<br>#{value}").show()
  $chart.on 'mouseleave', '.ct-point', ->
    ($ @).animate {'stroke-width': '4px'}, 100, easeOutQuad
    TimelineVars.toolTips[dataChart].hide()
  $chart.on 'mousemove', (e) ->
    TimelineVars.toolTips[dataChart].css
      left: (e.offsetX or e.originalEvent.layerX) - \
        TimelineVars.toolTips[dataChart].width() / 2 - 10
      top: (e.offsetY or e.originalEvent.layerY) - \
        TimelineVars.toolTips[dataChart].height() - 40
