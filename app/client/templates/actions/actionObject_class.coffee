exports = this

exports.ActionObject = class ActionObject
  constructor: (@firstYear = moment().year(), @building_id = Session.get('current_building_doc')._id, @scenario_year) ->
    #First year will be used to know when the action is applied
    #By default, the first year is the current year (useful if in the settings the price starts at 2014 and we're in 2015
    #In a Scenario, the firstYear is the year when the action is applied
    @allLeases = Leases.find(
                {building_id: @building_id},
                {sort: {lease_name:1}}
                ).fetch()

    if @scenario_year?
      @offset = @firstYear - @scenario_year
    else @offset = 0

    @data =
      endUse: []
      water: []
    @gain =
      kwhef_euro: []
      water_euro: []
      merged_fluids_euro: []
      merged_fluids_euro_actualized: []
      operatingSavings_array: []
      operatingSavings_array_actualized: []
      fluidImpact_in_kwhef: 0

    @flux =
      flux_notActualized: []
      flux_actualized: []
      flux_accumulation: []

    @investment =
      values:[]
      values_act:[] #Actualized values

    @efficiency =
      raw_roi: 0
      value_analysis: 0
      irr: 0
      TRA: 0
      LEC: 0


    @getWaterDataFromLeases() # Init water Data



  getMatchingEndUseInLease : (index, endUseOpportunity) =>
    ## When we have an opportinity, we go through all Leases to find the corresponding endUse (in the Lease)
    matchingEndUseInLease = []

    ## Go through all Leases
    for lease, leaseIndex in @allLeases
      ## Go through all end_uses of the lease, and match with the opportunity (ie. endUseOpportunity)
      for endUse in lease.consumption_by_end_use when endUse.end_use_name is endUseOpportunity
        ## Save lease_name and consumption_by_end_use_total
        endUse.lease_name = lease.lease_name
        endUse.consumption_by_end_use_total = lease.consumption_by_end_use_total

        ## For each EndUse found, we search for the corresponding Fluid in the conf
        confFluids = Session.get('current_config').fluids
        for fluid in confFluids
          completeFluideName = fluid.fluid_provider + " - " + fluid.fluid_type
          if completeFluideName is endUse.fluid_id
            endUse.fluid = fluid #We store the Fluid in the array

            matchingEndUseInLease[leaseIndex] = endUse

    @data.endUse[index] = matchingEndUseInLease ## return array

    ###
    matchingEndUseInLease looks like
              [{
                  "end_use_name":"end_use_heating",
                  "fluid_id":"EDF - fluid_heat",
                  "lease_name":"Lease1Test",
                  "first_year_value":12,
                  "consumption_by_end_use_total":98,
                  "fluid":{
                      "fluid_type":"fluid_heat",
                      "fluid_provider":"EDF",
                      "yearly_values":[
                          {"year":2014,"cost":10,"evolution_index":0},
                          {"year":2015,"cost":10,"evolution_index":0},
                          ...
                          {"year":2044,"cost":10.5,"evolution_index":0}
                      ],
                      "global_evolution_index":5
                  }
              },
              {
                  "end_use_name":"end_use_heating",
                  "fluid_id":"EDF - fluid_electricity",
              }
    ###

  kWhEFGainFromPercent : (index, gain_percent) =>
    # Transform percent value in actual kWhef gain, for the considered EndUse
    total = 0
    # We go through each endUse and sum the percent*EndUse_consumption
    for endUse in @data.endUse[index]
      endUse.gain_kwhef_perLease = (endUse.first_year_value * gain_percent/100).toFixed(2)*1 # Also save the result
      total += endUse.gain_kwhef_perLease
    total.toFixed(2)*1

  # Transform kwhef savings in Euro gain
  transform_EndUseGain_kwhef_inEuro : ( index ) ->
    # Go through all endUses
    for endUse in @data.endUse[index]
      ## For each endUse, calc. the yearly Euro savings in an Array (gain_kwhef_perLease * yearly fuild cost)
      endUse.gain_euro_perLease = []
      for year, year_index in endUse.fluid.yearly_values when year.year >= @firstYear
        result = (endUse.gain_kwhef_perLease * year.cost).toFixed(2)*1
        endUse.gain_euro_perLease.push(result)

  sum_endUseGains_inEuro : ( index ) ->
    # Get gain_euro_perLease for all endUses in an Array (that we'll sum just after)
    gain_euro_perLease_array = _.map @data.endUse[index], (endUse, index) ->
      return endUse.gain_euro_perLease
    # Sum all yearly values to get the total euro Gain for this EndUse
    # In other words: we have the total euro gain, for all Leases concerned, ie. for the Building, for this endUse
    @gain.kwhef_euro[index] = addValuesForArrays gain_euro_perLease_array

  removeExtraEndUse: (fluids_nb) =>
    # console.log "I was called with a param of #{fluids_nb}"
    # http://stackoverflow.com/questions/8205710/remove-a-value-from-an-array-in-coffeescript
    @data.endUse = @data.endUse[0..fluids_nb-1]
    @gain.kwhef_euro = @gain.kwhef_euro[0..fluids_nb-1]


  # --- WATER ---

  getWaterDataFromLeases: () =>
    ## For each Lease, find the Water Data
    for lease, leaseIndex in @allLeases
      # Go through all fluid_consumption_meter of the lease, find Water fluid
      for lease_fluid in lease.fluid_consumption_meter when lease_fluid.fluid_id.indexOf("water") > -1
        lease_fluid.lease_name = lease.lease_name

        # For each Water consumption found, we search for the corresponding Fluid in the conf
        confFluids = Session.get('current_config').fluids
        for fluid in confFluids
          completeFluideName = fluid.fluid_provider + " - " + fluid.fluid_type
          if completeFluideName is lease_fluid.fluid_id
            lease_fluid.fluid = fluid #We store the Fluid in the array

            @data.water[leaseIndex] = lease_fluid
    #@waterData #ToDelete

  # Apply the gain_percent to the Water consumption for all Leases, to get a value in m3
  waterGainFromPercent : (gain_percent) =>
    # Transform percent value in actual m3 water gain
    total = 0
    for water_fluid in @data.water
      water_fluid.gain_water_perLease = (water_fluid.first_year_value * gain_percent/100).toFixed(2)*1 ;
      total += water_fluid.gain_water_perLease
    total

  # Transform m3 savings in Euro gain
  transform_WaterGain_inEuro : () =>
    for water_fluid in @data.water
      ## For each water_fluid, calc. the yearly Euro savings in an Array (gain_water_perLease * yearly fuild cost)
      water_fluid.gain_euro_perLease = []
      for year, year_index in water_fluid.fluid.yearly_values when year.year >= @firstYear
        #We skip the values in the settings that are inferior to the firstYear
        result = (water_fluid.gain_water_perLease * year.cost).toFixed(2)*1
        water_fluid.gain_euro_perLease.push(result)

  # Sum Euro gains for all Leases
  sum_waterGains_inEuro : () =>
    # Get gain_euro_perLease for all Leases in an Array (that we'll sum just after)
    gain_euro_perLease_array = _.map @data.water, (water_fluid, index) ->
      return water_fluid.gain_euro_perLease
    # Sum all yearly values to get the total euro Gain for this EndUse
    # In other words: we have the total euro gain, for all Leases concerned, ie. for the Building, for this endUse
    @gain.water_euro = addValuesForArrays gain_euro_perLease_array



  # --- UTILITIES ---

  sum_all_fluids_inEuro : (kwhef_multiple_array, water_array) =>
    all_fluids_euro = [];
    all_fluids_euro.push( addValuesForArrays(kwhef_multiple_array) ) #push the merge of all EndUse euro gain
    if water_array? then all_fluids_euro.push(water_array)
    @gain.merged_fluids_euro = addValuesForArrays( all_fluids_euro ) #return the sum of all fluid Euro gains

  sum_all_kwhef_fluids_in_kwhef: () =>
    fluidImpact_in_kwhef =0 ;
    for endUse in @data.endUse
      for lease in endUse
        fluidImpact_in_kwhef += lease.gain_kwhef_perLease
    @gain.fluidImpact_in_kwhef = fluidImpact_in_kwhef

  # --- EFFICIENCY ---

  calc_raw_roi : (residual_cost, total_fluid_savings_year_0, gain_operating_cost) =>
    # "Coût d'investissement" / ("Impact Fluide en €/an" + "Gain sur les autres charges d'exploit en €/an")
    # Anciennement = "Coût d'investissement" / ("Impact Fluide en €/an" + "Coût en fonctionnement en €/an")
    raw_roi = residual_cost / (total_fluid_savings_year_0 + gain_operating_cost); #Validé avec @Blandine : année 0 des économies d'énergie
    @efficiency.raw_roi = raw_roi.toFixed(2)*1

  calc_value_analysis: (action_lifetime, residual_cost) =>
    @sum_all_kwhef_fluids_in_kwhef()
    @efficiency.value_analysis = action_lifetime * @gain.fluidImpact_in_kwhef / residual_cost
    # value_analysis.toFixed(2)*1

  prepare_investment_arrays: (action_lifetime, residual_cost) =>
    # PREPARE INVESTMENT_COST_ARRRAY (for residual_cost)
    # create an array for investment cost with as many 0 as the action_lifetime
    # Array size is action_lifetime and not (action_lifetime+1): OK by Blandine Melay 2015-01-15
    @investment.values = buildArrayWithZeroes action_lifetime
    @investment.values[@offset]= residual_cost #The residual_cost is either in 0 or in the OFFSET pos.

    # ACTUALIZE INVESTMENT_COST_ARRRAY (for residual_cost)
    # Actualize the array: =current_year_val*(1+actualization_rate)^(-index)
    @investment.values_act = _.map @investment.values, (num, ic_index) ->
      result = num * Math.pow( 1+actualization_rate , -ic_index)
      return result.toFixed(2)*1

    # console.log "@investment.values is #{@investment.values}"
    # console.log "@investment.values_act is #{@investment.values_act}"
    # @Blandine, BSE, PEM : Actualisation fait diminuer l'investissement ?

  actualize_merged_fluids_euro: () =>
    #L'éco. de fluides est calc. avec le coût du fluide (qui évolue) : only Actualiser (pas inflater) - confirmé le 14/1
    @gain.merged_fluids_euro_actualized = _.map(@gain.merged_fluids_euro, (num, index)->
                result = num * Math.pow( 1+actualization_rate , -index);
                return result.toFixed(2)*1;
            )
    return

  prepare_operatingSavings_arrays: (action_lifetime, gain_operating_cost) =>
    # Operating savings (économie de frais d'exploitation) - a appliquer chaque année
    @gain.operatingSavings_array = buildArrayWithZeroes(action_lifetime)
    i = 0
    while i < action_lifetime
      @gain.operatingSavings_array[i] = gain_operating_cost
      i++
    #Actualize the array: =current_year_val*(1+actualization_rate)^(-index)
    @gain.operatingSavings_array_actualized = _.map(@gain.operatingSavings_array, (num, ic_index) ->
      result = num * (1 + actualization_rate) ** (-ic_index)
      result.toFixed(2) * 1
    )

  prepare_flux_arrays: () =>
    # PREPARE FLUX NOT ACTUALIZED (savings - investments)
    @flux.flux_notActualized = _.map(@investment.values, (num, tmp_index) =>
      return -@investment.values[tmp_index] \
              + @gain.operatingSavings_array[tmp_index] \
              + @gain.merged_fluids_euro[tmp_index]
      )
    # PREPARE FLUX ACTUALIZED
    @flux.flux_actualized  = _.map(@investment.values_act, (num, tmp_index) =>
        return -@investment.values_act[tmp_index] \
                + @gain.operatingSavings_array_actualized[tmp_index] \
                + @gain.merged_fluids_euro_actualized[tmp_index] #check suite aux retours de @Blandine sur l'actualisation des fluides
      )
    # PREPARE FLUX ACCUMULATION
    _.each(@flux.flux_actualized, (num, tmp_index) =>
        if tmp_index is 0 then result = num
        else result = @flux.flux_accumulation[tmp_index-1] + num

        @flux.flux_accumulation[tmp_index] = result.toFixed(2) * 1
      )
    # console.log "@flux.flux_notActualized is ", @flux.flux_notActualized
    # console.log "@flux.flux_actualized is ", @flux.flux_actualized
    # console.log "@flux.flux_accumulation is ", @flux.flux_accumulation

  calc_IRR: () =>
    irr = IRR( @flux.flux_notActualized )
    return @efficiency.irr = (irr * 100).toFixed(2) * 1 # Format IRR to what we want to display

  calc_TRA: () =>
    #We find the first positive value in the flux_accumulation
    firstPositive = _.find(@flux.flux_accumulation, (num) ->
      if num >= 0 then return num
    )
    @efficiency.TRA = _.indexOf(@flux.flux_accumulation, firstPositive) # if value is not found: returns -1
    # console.log("TRA: #{@efficiency.TRA}");
    return @efficiency.TRA

  calc_LEC: (action_lifetime) =>
    # = coût d'investissement (ie. 'reduce' du tableau) / (durée vie * éco d'énergie en kWh pour chaque fluide)
    # Not using Water savings - normal (might be another variable, in V2)
    total_investment = _.reduce(@investment.values_act, ((memo, num) ->
      memo + num
    ), 0)
    @efficiency.LEC = (total_investment / (action_lifetime * @gain.fluidImpact_in_kwhef)).toFixed(2) * 1
    # console.log "@efficiency.LEC: #{@efficiency.LEC}"
    return @efficiency.LEC

