# @TODO /!\ Actions liés action_link
# @TODO Review total cost as it depends on when the actions are performed

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
    @fluidInSettings = {}
    @coefs = {}
    @projectTypeIndexes = {}
    @actualizationRate = 0
    @consumptionDegradation = 0
    @charts =
      ticks: []
      budget: []
      consumption: water: [], co2: [], kwh: []
      invoice: water: [], electricity: [], cool: [], heat: []
    @currentFilter = null
  ###*
   * Get the scenario, the buildings and the portfolios from the router's data.
   * @param {Object} data Data received from the Router.
  ###
  getRouterData: (data) ->
    @scenario = data.scenario
    @buildings = data.buildings
    @portfolios = data.portfolios
  ###*
   * Set minimum date based on scenario's creation date and maximum
   * date based on scenario's duration.
  ###
  setMinMaxDate: ->
    creationYear = (moment (Session.get 'current_config').creation_date).year()
    @minDate = moment year: creationYear
    @maxDate = moment day:30, month:11, year:creationYear+@scenario.duration
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
    @actualizationRate = settings.other_indexes.actualization_rate
    # Cunsumption degradation
    @consumptionDegradation = settings.other_indexes.consumption_degradation
    # Remove ICC values that doesn't fit between minDate / maxDate
    @coefs['icc'] = []
    for icc in settings.icc.evolution_index
      if minYear <= icc.year <= maxYear
        @coefs['icc'].push icc.cost
    # Remove IPC values that doesn't fit between minDate / maxDate
    @coefs['ipc'] = []
    for ipc in settings.ipc.evolution_index
      if minYear <= ipc.year <= maxYear
        @coefs['ipc'].push ipc.cost
    # Remove fluids year values that doesn't fit between minDate / maxDate
    @fluidInSettings = {}
    for fluid in settings.fluids
      year = fluid.yearly_values.year
      fluidOverYear = []
      for fluidForYear in fluid.yearly_values
        if minYear <= fluidForYear.year <= maxYear
          fluidOverYear.push fluidForYear
      fluid['fluidOverYear'] = fluidOverYear
      @fluidInSettings["#{fluid.fluid_provider} - #{fluid.fluid_type}"] = fluid
    # Coefs for kWh to CO2
    @coefs['kwh2CO2'] = settings.kwhef_to_co2_coefficients
    # Static indexes
    @projectTypeIndexes = settings.project_type_static_index
  ###*
   * Get the coef fo build for a project type.
   * @param {String} projectType Project type applied on the action.
  ###
  projectType2buildCoef: (projectType) ->
    return 1 if projectType is 'NA'
    @projectTypeIndexes[projectType]
  rxTimelineActions: new ReactiveVar
  ###*
   * Calculate values used under the TimelineTable.
   * @param {Array} buildingFilter Array of building's ID.
  ###
  calculateTimelineTable: (buildingFilter) ->
    # Get current filter value if calculation are called without filter
    if buildingFilter is undefined
      if @currentFilter is null
        @currentFilter = _.pluck @buildings,'_id'
      buildingFilter = @currentFilter
    else
      @currentFilter = buildingFilter
    # Reset the timelineAction
    timelineActions = []
    # Sort planned actions
    # Unplanned actions are pushed to the end of the Array
    @scenario.planned_actions = _.sortBy @scenario.planned_actions, (item) =>
      return (@maxDate.clone().add 1, 'y').valueOf() if item.start is null
      item.start.valueOf()
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
          # Get out of the loop if remaining actions are unplanned
          break if paction.start is null
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
    @rxTimelineActions.set timelineActions
  ###*
   * Transform kWh to CO2 depending on energy type.
   * @param {Number} kwh    kWh
   * @param {String} energy Type of energy: fluid_electricity,
   *                        fluid_fuelOil_heavy, fluid_fuelOil_house,
   *                        fluid_naturalGas, fluid_woodEnergy.
  ###
  kwh2Co2: (kwh, energy) -> kwh * @coefs.kwh2CO2[energy]
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
    exp_water = exp_elec = exp_cool = exp_heat = 0
    # Years since the scenario's start
    yearsSinceStart = quarter.year() - @minDate.year()
    for building in @buildings
      for lease in building.leases
        for cons in lease.fluid_consumption_meter
          # Get degraded consumption divided by 4 as calc is on quarter
          consumption = cons.first_year_value / 4 * \
            Math.pow 1 + @consumptionDegradation, yearsSinceStart
          # Get fluid provider
          cons.fluidProvider = @fluidInSettings[cons.fluid_id]
          # Get fluid matter
          if cons.fluidProvider.fluid_type is 'fluid_water'
            cons_water += consumption
          else
            cons_kwh += consumption
            # Adjust CO2 depending on energy matter
            cons_co2 += @kwh2Co2 consumption, \
              cons.fluidProvider.kwhef_to_co2_coefficient
          # Get subscription
          subscription = cons.yearly_subscription
          # Get the rate depending on the year
          rate = cons.fluidProvider.fluidOverYear[yearsSinceStart].cost
          # Get expense as the product of the rate and the consumption
          expense = rate * consumption
          # Subscription is paid at the end of the year
          expense += subscription if quarter.quarter() is 4
          # Inflated expense
          inflatedExpense = expense * \
            (Math.pow 1 + @actualizationRate, yearsSinceStart) *
            (Math.pow 1 + @coefs.ipc[yearsSinceStart], yearsSinceStart)
          # Assign expense to a fluid kind
          switch cons.fluidProvider.fluid_type
            when 'fluid_water' then exp_water += inflatedExpense
            when 'fluid_electricity' then exp_elec += inflatedExpense
            when 'fluid_heat' then exp_heat += inflatedExpense
            else exp_cool += expense
    @charts.consumption.water.push cons_water
    @charts.consumption.co2.push cons_co2
    @charts.consumption.kwh.push cons_kwh
    @charts.invoice.water.push exp_water
    @charts.invoice.electricity.push exp_elec
    @charts.invoice.cool.push exp_cool
    @charts.invoice.heat.push exp_heat
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
    # Reset totalCost as dynamic chart are subject to plannification.
    @totalCost = 0
    # Generate suites for each action
    for paction, idx in @scenario.planned_actions
      # Denormalize building's name and portfolio's id
      building = _.findWhere @buildings, _id: paction.action.building_id
      paction.buildingName = building.building_name
      paction.portfolioId = building.portfolio_id
      # Denormalize and format cost
      paction.formattedCost = "#{(numeral \
        paction.action.investment.cost).format '0,0[.]00'} €"
      # Skip calculation on loop when reaching unplanned actions
      if paction.start is null
        # Reset former message
        paction.quarter = "#{TAPi18n.__ 'unplanned_female'}"
        continue
      # Denormalize date
      paction.quarter = \
        "#{TAPi18n.__ 'quarter_abbreviation'}#{paction.start.format 'Q YYYY'}"
      # Prepare triggering dates
      paction.endDesign = paction.start.clone().add \
        paction.action.design_duration, 'M'
      paction.endWork = paction.endDesign.clone().add \
        paction.action.works_duration, 'M'
      paction.end = paction.endWork.clone().add \
        paction.action.action_lifetime, 'y'
      # Reset former calculations
      paction.consumptionWater = []
      paction.consumptionCo2 = []
      paction.consumptionKwh = []
      paction.invoiceWater = []
      paction.invoiceElectricity = []
      paction.invoiceCool = []
      paction.invoiceHeat = []
      paction.allGains = []
      paction.investment = []
      paction.investmentSubventioned = []
      # Iterate over the scenario duration
      quarter = @minDate.clone()
      nextQuarter = quarter.clone().add 1, 'Q'
      investment = investmentSubventioned = 0
      consumptionWater = consumptionKwh = consumptionCo2 = 0
      invoiceWater = invoiceElectricity = invoiceCool = invoiceHeat = 0
      allGains = 0
      # On each action, iterate over the scenario's duration
      while quarter.isBefore @maxDate
        # Calculate year since begining of the scenario for the current quarter
        yearsSinceStart = quarter.year() - @minDate.year()
        # Action is taken into account only when design is started
        if paction.start.isBetween quarter, nextQuarter
          # Investment and subventions starts when work on action begins.
          # Investments are inflated on ICC depending on year of application
          # of the action while subventions remain unchanged.
          investment = unless paction.action.investment?.cost then 0 else \
            paction.action.investment.cost * \
            Math.pow 1 + @coefs.icc[yearsSinceStart], yearsSinceStart
          # Subvention are not subject to inflation.
          # Investment - Subventionned is subject to coefficient on
          # the project type (a coefficient of build).
          investmentSubventioned = investment - \
            unless paction.action.subventions?.or_euro then 0 else \
            (paction.action.subventions.or_euro * \
              (@projectType2buildCoef paction.action.project_type))
          # Set inflated total cost in TDC (minus VAT)
          # depending on time and planned actions.
          @totalCost += investmentSubventioned
        # Results of an action on consumption starts when action is done
        if paction.endWork.isBetween quarter, nextQuarter
          # Analyse gain for water fluids
          for gain in paction.action.gain_fluids_water
            # Gains are expressed over years so divide them for each quarters.
            consumptionWater -= gain.or_m3 / 4
            invoiceWater -= gain.yearly_savings / 4 * \
              Math.pow 1 + @actualizationRate, @coefs.ipc[yearsSinceStart]
            # Get each fluid provider if it hasn't been already calculated.
            if gain.fluidProvider is undefined
              for key, val of @fluidInSettings
                if key.search(gain.opportunity) isnt -1
                  gain.fluidProvider = @fluidInSettings[key]
          # Analyse gain for other fluids
          for gain in paction.action.gain_fluids_kwhef
            # Gains are expressed over years so divide them
            #  for each quarters.
            consumptionKwh -= gain.or_kwhef / 4
            # Get each fluid provider if it hasn't been already calculated
            if gain.fluidProvider is undefined
              # Get building on which the action is performed
              building = _.findWhere @buildings,
                _id: paction.action.building_id
              # Parse each lease to find which end use on which the gain
              # is applied.
              for lease in building.leases
                # Parse each consumption by end use for determining
                #  the associated fluid provider.
                for cons in lease.consumption_by_end_use
                  if cons.end_use_name is gain.opportunity
                    gain.fluidProvider = @fluidInSettings[cons.fluid_id]
                    break
                break if gain.fluidProvider isnt undefined
            # Group type of invoice on end use.
            # Gains are expressed over years so divide them
            #  for each quarters.
            switch gain.fluidProvider.fluid_type
              when 'fluid_heat'
                invoiceHeat -= gain.yearly_savings / 4 * \
                  Math.pow 1 + @actualizationRate, @coefs.ipc[yearsSinceStart]
              when 'fluid_electricity'
                invoiceElectricity -= gain.yearly_savings / 4 * \
                  Math.pow 1 + @actualizationRate, @coefs.ipc[yearsSinceStart]
              else
                invoiceCool -= gain.yearly_savings / 4 * \
                  Math.pow 1 + @actualizationRate, @coefs.ipc[yearsSinceStart]
            # Set the CO2 consumption depending on the type of energy.
            consumptionCo2 -= @kwh2Co2 gain.or_kwhef, \
              gain.fluidProvider.kwhef_to_co2_coefficient
          # Other gains are inflated and spread on all quarters.
          allGains = invoiceWater + invoiceHeat + invoiceElectricity + \
            invoiceCool - paction.action.gain_operating.cost / 4 * \
            Math.pow 1 + @actualizationRate, @coefs.ipc[yearsSinceStart]
        # Results of an action stops if its lifetime is exceeded
        if paction.end.isBetween quarter, nextQuarter
          consumptionWater = consumptionKwh = 0
          invoiceWater = invoiceElectricity = invoiceCool = invoiceHeat = 0
        # Set modifiers on consumption
        paction.consumptionWater.push consumptionWater
        paction.consumptionCo2.push consumptionCo2
        paction.consumptionKwh.push consumptionKwh
        # Set modifiers on consumption
        paction.invoiceWater.push invoiceWater
        paction.invoiceElectricity.push invoiceElectricity
        paction.invoiceCool.push invoiceCool
        paction.invoiceHeat.push invoiceHeat
        # Set modifiers on all gains
        paction.allGains.push allGains
        # Set values on investments and subventions
        paction.investment.push investment
        paction.investmentSubventioned.push investmentSubventioned
        # Increment by 1 quarter
        quarter.add 1, 'Q'
        nextQuarter.add 1, 'Q'
    # Assign reactive vars
    @rxPlannedActions.set @scenario.planned_actions
  ###*
   * Update the scenario in th DB.
  ###
  updateDbScenario: ->
    # Update DB
    formattedActions = _.map @scenario.planned_actions, (paction) ->
      action_id: paction.action_id
      start: if paction.start is null then null else paction.start.toDate()
      efficiency_ratio: paction.efficiency_ratio
    # console.table formattedActions
    Scenarios.update {_id: @scenario._id}, \
      $set:planned_actions:formattedActions
