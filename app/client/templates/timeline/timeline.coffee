# @TODO Planned action vs unplanned actions

# Isolate calculated value in a namespace
@TimelineVars =
  ###*
   * Reset current object to its default values.
  ###
  reset: ->
    @totalCost = 0
    @scenario = null
    @buildings = []
    @portfolios = []
    @minDate = null
    @maxDate = null
    @coefs = {}
    @actualization_rate = 0
    @consumption_degradation = 0
    @charts =
      ticks: []
      budget: []
      consumption: water: [], co2: [], kwh: []
      expense: water: [], electricity: [], frost: [], heat: []
    @currentFilter = null
  scenario: null
  buildings: []
  portfolios: []
  ###*
   * Get the scenario, the buildings and the portfolios from the router's data.
   * @param {Object} data Data received from the Router.
  ###
  getRouterData: (data) ->
    @scenario = data.scenario
    @buildings = data.buildings
    @portfolios = data.portfolios
  minDate: null
  maxDate: null
  ###*
   * Set minimum date based on scenario's creation date and maximum
   * date based on scenario's duration.
   * @TODO BSE: MinDate is false: it should be the date of the creation.
  ###
  setMinMaxDate: ->
    creationYear = (moment (Session.get 'current_config').creation_date).year()
    @minDate = moment year: creationYear
    @maxDate = moment day:30, month:11, year:creationYear+TV.scenario.duration
  fluids: []
  coefs: {}
  actualization_rate: 0
  consumption_degradation: 0
  ###*
   * Get fluids and coefficients from current configuration.
   * Remove the values that are before minDate and after maxDate and expand
   * them on each quarter.
  ###
  getFluidsAndCoefs: ->
    settings = Session.get 'current_config'
    minYear =  @minDate.year()
    maxYear = @maxDate.year()
    # Actualization rate
    @actualization_rate = settings.other_indexes.actualization_rate
    # Cunsumption degradation
    @consumption_degradation = settings.other_indexes.consumption_degradation
    # Expand ICC on quarters, remove what doesn't fit between minDate / maxDate
    @coefs['icc'] = []
    for icc in settings.icc.evolution_index
      if minYear <= icc.year <= maxYear
        @coefs['icc'].push icc.cost for quarter in [1..4]
    # Expand IPC on quarters, remove what doesn't fit between minDate / maxDate
    @coefs['ipc'] = []
    for ipc in settings.ipc.evolution_index
      if minYear <= ipc.year <= maxYear
        @coefs['ipc'].push ipc.cost for quarter in [1..4]
    # Expand the fluid's yearly value on all quarters, remove what
    #  doesn't fit between minDate / maxDate
    fluidInSettings = {}
    for fluid in settings.fluids
      year = fluid.yearly_values.year
      fluidOverQuarter = []
      for fluidOverYear in fluid.yearly_values
        if minYear <= fluidOverYear.year <= maxYear
          fluidOverQuarter.push fluidOverYear for quarter in [1..4]
      fluid['fluidOverQuarter'] = fluidOverQuarter
      fluidInSettings["#{fluid.fluid_provider} - #{fluid.fluid_type}"] = fluid
    # Coefs for kWh to CO2
    @coefs['kwh2CO2'] = settings.kwhef_to_co2_coefficients
  totalCost: 0
  ###*
   * Iterate over each action for getting their cost.
  ###
  calculateTotalCost: ->
    for paction in @scenario.planned_actions
      # Total costs
      # @TODO Removed?
      # @totalCost += paction.action.investment.cost
      @totalCost += paction.action.investment.ratio
  rxTimelineActions: new ReactiveVar
  currentFilter: null
  ###*
   * Calculate values used under the TimelineTable.
   * @param {Array} buildingFilter Array of building's ID.
  ###
  calculateTimelineTable: (buildingFilter) ->
    # Get current filter value if calculation are called without filter
    if buildingFilter is undefined
      if @currentFilter is null
        @currentFilter = _.pluck TV.buildings,'_id'
      buildingFilter = @currentFilter
    else
      @currentFilter = buildingFilter
    # Reset the timelineAction
    timelineActions = []
    # Sort planned actions
    @scenario.planned_actions = _.sortBy @scenario.planned_actions, (item) ->
      (moment item.start).valueOf()
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
          paction = @scenario.planned_actions[currentAction]
          # Check if current action is contained in the current filter
          if paction.action.building_id in buildingFilter
            # Check if current action is contained in the current quarter
            break unless paction.start.isBetween quarter, nextQuarter
            # Set the current action in the current quarter
            quarterContent.tActions.push paction.action
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
        # Set year in the timeline
        yearContent.quarterContent.push quarterContent
        # Increment by 1 quarter
        quarter.add 1, 'Q'
        nextQuarter.add 1, 'Q'
      timelineActions.push yearContent
    # Assign reactive vars
    TV.rxTimelineActions.set timelineActions
  charts:
    ticks: []
    budget: []
    consumption: water: [], co2: [], kwh: []
    expense: water: [], electricity: [], frost: [], heat: []
  ###*
   * Iterator function that creates ticks (labels used in the chart's xAxis)
   * for each quarter.
   * @param {Moment} quarter Moment as a quarter.
  ###
  itFctTicks: (quarter) ->
    # Labels for charts
    @charts.ticks.push \
      "#{TAPi18n.__ 'quarter_abbreviation'}#{quarter.format 'Q YYYY'}"
  ###*
   * Iterator function that calculates budget for each quarter.
   * @param {Moment} quarter Moment as a quarter.
  ###
  itFctBudget: (quarter) ->
    # Budget line for chart
    @charts.budget.push @scenario.total_expenditure
  ###*
   * Iterator function that performs calculations that depends on buildings
   * and leases: consumptions and expenditure.
   * @param {Moment} quarter Moment as a quarter.
  ###
  itFctCalcFromBuildings: (quarter) ->
    # Consumption depending on fluid type
    cons_water = cons_co2 = cons_kwh = 0
    # Expenses depending on fluid kind
    exp_water = exp_elec = exp_frost = exp_heat = 0
    # Years since the scenario's start
    yearsSinceStart = quarter.year() - @minDate.year()
    for building in @buildings
      for lease in building.leases
        for cons in lease.consumption_by_end_use
          # Get inflated consumption
          consumption = cons.first_year_value * \
            Math.pow 1 + @consumption_degradation, yearsSinceStart
          # Check energy type
          fluidType = (cons.fluid_id.split ' - ')[1]
          if fluidType is 'fluid_water'
            cons_water += consumption
          else
            cons_kwh += consumption
            # @TODO Energy mater isn't defined?
            cons_co2 += consumption * @coefs.kwh2CO2.fluid_electricity
          # Get fluid provider
          fluidProvider = _.findWhere lease.fluid_consumption_meter,
            fluid_id: cons.fluid_id
          # Get inflated subscription based on ICC
          subscription = fluidProvider.yearly_subscription
          inflatedSubscription = subscription * \
            Math.pow 1 + @actualization_rate, @coefs.icc[yearsSinceStart]
          # Get inflated rate based on IPC
          rate = fluidProvider.first_year_value
          inflatedRate = rate * \
            Math.pow 1 + @actualization_rate, @coefs.icc[yearsSinceStart]
          # Inflated expense independent from fluid kind
          expense = inflatedRate * consumption
          # Subscription is paid at the end of the year
          expense += inflatedSubscription if quarter.quarter() is 4
          # Assign expense to a fluid kind
          switch fluidType
            when 'fluid_water' then exp_water += expense
            when 'fluid_electricity' then exp_elec += expense
            when 'fluid_heat' then exp_heat += expense
            else exp_frost += expense
    @charts.consumption.water.push cons_water
    @charts.consumption.co2.push cons_co2
    @charts.consumption.kwh.push cons_kwh
    @charts.expense.water.push exp_water
    @charts.expense.electricity.push exp_elec
    @charts.expense.frost.push exp_frost
    @charts.expense.heat.push exp_heat
  ###*
   * Iterates over quarters for calculating ticks, budget and consumption.
  ###
  calculateStaticCharts: ->
    quarter = @minDate.clone()
    while quarter.isBefore @maxDate
      # Ticks
      @itFctTicks quarter
      # Budget
      @itFctBudget quarter
      # Consumption
      @itFctCalcFromBuildings quarter
      # Increment by 1 quarter
      quarter.add 1, 'Q'
  rxPlannedActions: new ReactiveVar
  ###*
   * Perform all calculations and fill the global TimelineVars object.
  ###
  calculateDynamicChart: ->
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
    #
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
          # @TODO Removed?
          #investment = paction.action.investment.cost
          #investmentSubventioned = paction.action.subventions.residual_cost
          investment = 2.4
          investmentSubventioned = 1.5
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
    #console.table _.map TV.scenario.planned_actions, (paction) ->
    #  id: paction.action_id
    #  start: (moment paction.start).format 'Q YYYY'

# Local alias on the namespaced variables for the Timeline
TV = TimelineVars

###*
 * Prepare calculation at template creation.
###
Template.timeline.created = ->
  # Reactive var for choosing consumption chart for energy type
  @rxEnergyType = new ReactiveVar
  @rxEnergyType.set 'water'
  # Reset current TimelineVars
  TV.reset()
  # Get denormalized scenario, buildings and portfolios from router
  # @TODO check for unplanned actions
  TV.getRouterData @data
  # Set minimum and maximum date
  TV.setMinMaxDate()
  # Get fluids and coefficients
  TV.getFluidsAndCoefs()
  # Get scenario total cost
  TV.calculateTotalCost()
  # Create ticks, consumption and budget charts
  TV.calculateStaticCharts()
  # Reactively perform TimelineTable refresh based on filter changes
  @autorun ->
    buildingFilter = Session.get 'timeline-filter-portfolio-or-building'
    # Calculate values used in the TimelineTable
    TV.calculateTimelineTable buildingFilter
  # Reactively perform TimelineTable and chart refresh on Scenario change
  @autorun (computation) ->
    scenario = Scenarios.findOne TV.scenario._id
    TV.calculateTimelineTable() unless computation.firstRun
    TV.calculateDynamicChart()

###*
 * Set the consumption chart filter at template rendering.
###
Template.timeline.rendered = ->
  $btnGroup = @$ '[data-role=\'energy-type\']'
  $btnGroup.children().removeClass 'active'
  energyType = @rxEnergyType.get()
  $selected = $btnGroup.find "[data-value=\'#{energyType}\']"
  $selected.addClass 'active'

###*
 * Object containing helper keys for the template.
###
Template.timeline.helpers
  scenarioName: -> TV.scenario.name
  isEnergyTypeWater: -> Template.instance().rxEnergyType.get() is 'water'
  isEnergyTypeCo2: -> Template.instance().rxEnergyType.get() is 'co2'
  isEnergyTypeKwh: -> Template.instance().rxEnergyType.get() is 'kwh'

###*
 * Object containing event actions for the template.
###
Template.timeline.events
  # Change filter on action bucket
  'click [data-role=\'energy-type\']': (e, t) ->
    $btnGroup = t.$ '[data-role=\'energy-type\']'
    $selected = $ e.target
    value = $selected.attr 'data-value'
    unless value is undefined
      $btnGroup.children().removeClass 'active'
      $selected.addClass 'active'
      t.rxEnergyType.set $selected.attr 'data-value'
