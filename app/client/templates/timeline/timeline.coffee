# @TODO Planned action vs unplanned actions
# @TODO Filters on buildings

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
   * Perform all calculations and fill the global TimelineVars object.
  ###
  calculate: ->
    console.log 'calculate', @
    # Sort planned actions
    @scenario.planned_actions = _.sortBy @scenario.planned_actions, (item) ->
      (moment item.start).valueOf()
    # Reset charts that doesn't depends on actions
    @charts = { ticks: [], budget: [], consumption: [] }
    # Index on the actions table
    currentAction = 0
    # Build formatted data
    quarter = @minDate.clone()
    nextQuarter = quarter.clone().add 1, 'Q'
    while quarter.isBefore @maxDate
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
          break unless @scenario.planned_actions[currentAction]?
          # Get current action date (set in the Scenario)
          date = moment @scenario.planned_actions[currentAction].start
          # Check if current action is contained in the current quarter
          break unless date.isBetween quarter, nextQuarter
          # Set the current action in the current quarter
          quarterContent.tActions.push @actions[currentAction]
          # Total costs
          @totalCost += @actions[currentAction].investment.cost
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
        @charts.budget.push @scenario.total_expenditure
        # Labels for charts
        @charts.ticks.push \
          "#{TAPi18n.__ 'quarter_abbreviation'}#{quarter.format 'Q YYYY'}"
        # Current consumption for charts
        # @TODO Fake data
        @charts.consumption.push 3.5
        # Set year in the timeline
        yearContent.quarterContent.push quarterContent
        # Increment by 1 quarter
        quarter.add 1, 'Q'
        nextQuarter.add 1, 'Q'
      @timelineActions.push yearContent
    # Generate suites for each action
    for action, idx in @actions
      # Denormalize date
      action.start = moment @scenario.planned_actions[idx].start
      action.quarter = \
        "#{TAPi18n.__ 'quarter_abbreviation'}#{action.start.format 'Q YYYY'}"
      # Denormalize building's name and portfolio's id
      building = _.findWhere @buildings, _id: action.building_id
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
      quarter = @minDate.clone()
      nextQuarter = quarter.clone().add 1, 'Q'
      investment = 0
      investmentSubventioned = 0
      consumptionCo2Modifier = 0
      consumptionKwhModifier = 0
      while quarter.isBefore @maxDate
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
  rxActions: new ReactiveVar
  rxTimelineActions: new ReactiveVar

###*
 * Prepare calculation at template creation.
###
Template.timeline.created = ->
  # Reset former state
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
  TimelineVars.calculate()
  # Assign reactive vars
  TimelineVars.rxActions.set TimelineVars.actions
  TimelineVars.rxTimelineActions.set TimelineVars.timelineActions

###*
 * Object containing helper keys for the template.
###
Template.timeline.helpers scenarioName: -> 'Toto'
