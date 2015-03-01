# @TODO Planned action vs unplanned actions

# Isolate calculated value in a namespace
@TimelineVars =
  scenario: null
  buildings: []
  totalCost: 0
  minDate: null
  maxDate: null
  rxPlannedActions: new ReactiveVar
  rxTimelineActions: new ReactiveVar
  charts:
    ticks: []
    budget: []
    consumption: []
  ###*
   * Perform all calculations and fill the global TimelineVars object.
  ###
  calculate: ->
    # Handle the portfolio and building filtering
    buildingFilter = Session.get 'timeline-filter-portfolio-or-building'
    buildingFilter = _.pluck TV.buildings, '_id' if buildingFilter is undefined
    # Reset the timelineAction
    timelineActions = []
    # Sort planned actions
    @scenario.planned_actions = _.sortBy @scenario.planned_actions, (item) ->
      (moment item.start).valueOf()
    # Reset charts that doesn't depends on actions
    @charts.budget = []
    @charts.consumption = []
    # Index on the actions table
    currentAction = 0
    # Build formatted data
    quarter = @minDate.clone()
    nextQuarter = quarter.clone().add 1, 'Q'

    # Graph 1
    # -------
    # PEM To expand on all buildings
    # For each leases: fluid_consumption_meter
    #     @allLeases = Leases.find(
    # {building_id: @building_id},
    # {sort: {lease_name:1}}
    # ).fetch()

    # PEM to get the unit of a fluid
    # confFluids = Session.get('current_config').fluids
    #for fluid in confFluids
    #  completeFluideName = fluid.fluid_provider + " - " + fluid.fluid_type
    #  if completeFluideName is endUse.fluid_id
    #    endUse.fluid = fluid #We store the Fluid in the array
    #    matchingEndUseInLease[leaseIndex] = endUse

    # PEM Get the appropriate coefficient for each type of unit
    # Session.get('current_config').kwhef_to_co2_coefficients

    # This provide 3 scalings
    # Before action
    # After actions
    # -> 6 graphs
    # /!\ Apply setting.other_indexes.consumption_degradation :
    # indepedent of the fluid

    # Graph 2
    # -------
    # Chart with action and without actions
    # Cold fluid is not available.
    # Invoice is done for each fluid:
    #  subscription(time) + price(year) * consumption(year)
    # consumption(year): calculated in graph 1
    # @allLeases.fluid_consumption_meter[ fluid_type ].yearly_subscription
    # Create an array for subscription(time):
    #  num * Math.pow( 1+actualization_rate , -ic_index)
    # subscription(year) =
    #  subscription(0) * (1+(inflation_rate))^year * (1+actualisation_rate)^year
    # actualisation_rate = setting.other_indexes.actualization_rate
    # inflation_rate(year) = setting.ipc.evolution_index[ year ].cost
    # price(year) =
    #  setting.fluids(
    #   for each fluid
    #  ).yearly_values[year]*(1+actualisation_rate)^year
    # /!\ yearly_values starts at 2014
    #  but the start of the scenario may be in 2017

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
          paction = @scenario.planned_actions[currentAction]
          # Check if current action is contained in the current filter
          if paction.action.building_id in buildingFilter
            # Check if current action is contained in the current quarter
            break unless paction.start.isBetween quarter, nextQuarter
            # Set the current action in the current quarter
            quarterContent.tActions.push paction.action
            # Total costs
            @totalCost += paction.action.investment.cost
          # Check next action
          currentAction++
        # Group actions in quarter by name
        if quarterContent.tActions.length > 0
          group = _.groupBy quarterContent.tActions, 'logo'
          quarterContent.tActions = []
          for key, value of group
            item =
              logo: key
              length: value.length
              actionIds: (_.pluck value, '_id').join ';'
            quarterContent.tActions.push item
        # Budget line for chart
        @charts.budget.push @scenario.total_expenditure
        # Current consumption for charts
        # @TODO Fake data
        @charts.consumption.push 3.5
        # Set year in the timeline
        yearContent.quarterContent.push quarterContent
        # Increment by 1 quarter
        quarter.add 1, 'Q'
        nextQuarter.add 1, 'Q'
      timelineActions.push yearContent
    # Generate suites for each action
    for paction, idx in @scenario.planned_actions
      # Denormalize date
      paction.quarter = \
        "#{TAPi18n.__ 'quarter_abbreviation'}#{paction.start.format 'Q YYYY'}"
      # Denormalize building's name and portfolio's id
      building = _.findWhere @buildings, _id: paction.action.building_id
      paction.buildingName = building.building_name
      paction.portfolioId = building.portfolio_id
      # Denormalize and format cost
      paction.formattedCost = (numeral \
        paction.action.investment.cost).format '0,0[.]00 $'
      # Prepare triggering dates
      paction.endDesign = paction.start.clone().add \
        paction.action.design_duration, 'M'
      paction.endWork = paction.endDesign.clone().add \
        paction.action.works_duration, 'M'
      paction.end = paction.endWork.clone().add \
        paction.action.action_lifetime, 'Y'
      paction.investmentSuite = []
      paction.investmentSubventionedSuite = []
      paction.consumptionCo2ModifierSuite = []
      paction.consumptionKwhModifierSuite = []
      # Iterate over the scenario duration
      quarter = @minDate.clone()
      nextQuarter = quarter.clone().add 1, 'Q'
      investment = 0
      investmentSubventioned = 0
      consumptionCo2Modifier = 0
      consumptionKwhModifier = 0
      while quarter.isBefore @maxDate
        if paction.start.isBetween quarter, nextQuarter
          investment = paction.action.investment.cost
          investmentSubventioned = paction.action.subventions.residual_cost
        if paction.endWork.isBetween quarter, nextQuarter
          # @TODO Fake modifiers
          consumptionCo2Modifier = -.5
          consumptionKwhModifier = -1
        paction.investmentSuite.push investment
        paction.investmentSubventionedSuite.push investmentSubventioned
        paction.consumptionCo2ModifierSuite.push consumptionCo2Modifier
        paction.consumptionKwhModifierSuite.push consumptionKwhModifier
        # Increment by 1 quarter
        quarter.add 1, 'Q'
        nextQuarter.add 1, 'Q'
    # Assign reactive vars
    TV.rxPlannedActions.set @scenario.planned_actions
    TV.rxTimelineActions.set timelineActions
    #console.table _.map TV.scenario.planned_actions, (paction) ->
    #  id: paction.action_id
    #  start: (moment paction.start).format 'Q YYYY'

  ###*
   * Create ticks (labels used in the chart's xAxis).
  ###
  createTicks: ->
    # Build formatted data
    quarter = @minDate.clone()
    while quarter.isBefore @maxDate
      # Labels for charts
      @charts.ticks.push \
        "#{TAPi18n.__ 'quarter_abbreviation'}#{quarter.format 'Q YYYY'}"
        # Increment by 1 quarter
        quarter.add 1, 'Q'

# Local alias on the namespaced variables for the Timeline
TV = TimelineVars

###*
 * Prepare calculation at template creation.
###
Template.timeline.created = ->
  # Get Scenario's data from router
  TV.scenario = @data
  # Reset former state
  TV.totalCost = 0
  # @TODO check for unplanned actions
  # Get actions that matches the Ids in the Scenario
  pactions = TV.scenario.planned_actions
  actionIds = _.pluck pactions, 'action_id'
  actions = (Actions.find  _id: $in: actionIds).fetch()
  # Denormalize actions in the scenario and transform the start date as moment
  for paction in pactions
    paction.action = _.findWhere actions, _id: paction.action_id
    paction.start = moment paction.start
  # Get each buildings for each actions
  buildingIds = _.uniq _.pluck actions, 'building_id'
  TV.buildings = (Buildings.find _id: $in: buildingIds).fetch()
  # Get each portfolios for each buildings
  portfolioIds = _.uniq _.pluck TV.buildings, 'portfolio_id'
  TV.portfolios = (Portfolios.find _id: $in: portfolioIds).fetch()
  # Get all leases for all building, this action is done in a single DB call
  # for avoiding too much latency on the screen's creation
  leases = (Leases.find building_id: $in: buildingIds).fetch()
  # Now dernomalize leases and buildings, re-establishing document object
  # for each building
  for building in TV.buildings
    building.leases = _.where leases, building_id: building._id
  # Set minimum date on the creation date and maximum date 31 years later
  creationYear = (moment (Session.get 'current_config').creation_date).year()
  TV.minDate = moment year: creationYear
  TV.maxDate = moment day:30, month:11, year:creationYear+TV.scenario.duration
  # Create ticks for the charts
  TV.createTicks()
  # Reactively perform calculations based on filter changes
  @autorun -> TV.calculate()

###*
 * Object containing helper keys for the template.
###
Template.timeline.helpers scenarioName: -> TV.scenario.name
