exports = this

exports.ActionObject = class ActionObject
  constructor: (@firstYear = moment().format('YYYY'), @building_id = Session.get('current_building_doc')._id ) ->
    #First year will be used to know when the action is applied
    #By default, the first year is the current year (useful if in the settings the price starts at 2014 and we're in 2015
    #In a Scenario, the firstYear is the year when the action is applied
    @allLeases = Leases.find(
                {building_id: @building_id},
                {sort: {lease_name:1}}
                ).fetch()
    @data =
      endUse: []
      water: []
    @gain =
      kwhef_euro: []
      water_euro: []
      merged_fluids_euro: []
    #@all_yearly_savings_simplyValues = [] # Will contain all savings, for each EndUse

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
    addValuesForArrays( all_fluids_euro ) #return the sum of all fluid Euro gains

# Utility function to sum all Gains
exports.sumAllGains = ( d, gain_operating_cost ) ->
  result = 0
  if d.total_endUseGain_inEuro? then result += d.total_endUseGain_inEuro[0]
  if d.total_waterGain_inEuro? then result += d.total_waterGain_inEuro[0]
  if gain_operating_cost? then result += gain_operating_cost
  result


