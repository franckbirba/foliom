exports = this

exports.ActionObject = class ActionObject
  constructor: (@firstYear = moment().format('YYYY') ) ->
    #First year will be used to know when the action is applied
    #By default, the first year is the current year (useful if in the settings the price starts at 2014 and we're in 2015
    #In a Scenario, the firstYear is the year when the action is applied
    @allLeases = Leases.find(
                {building_id:Session.get('current_building_doc')._id},
                {sort: {lease_name:1}}
                ).fetch()
    @allEndUseData = []
    @d = {}; # Data object
    @all_yearly_savings_simplyValues = [] # Will contain all savings, for each EndUse




exports.getMatchingEndUseInLease = (allLeases, endUseOpportunity) ->
  ## When we have an opportinity, we go through all Leases to find the corresponding endUse (in the Lease)
  matchingEndUseInLease = []

  ## Go through all Leases
  for lease, leaseIndex in allLeases
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

  matchingEndUseInLease ## return array

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
                        {"year":2016,"cost":10.1,"evolution_index":1},
                        ...
                        {"year":2043,"cost":10.5,"evolution_index":0},
                        {"year":2044,"cost":10.5,"evolution_index":0}
                    ],
                    "global_evolution_index":5
                }
            },
            {
                "end_use_name":"end_use_heating",
                "fluid_id":"EDF - fluid_electricity",
                "lease_name":"thisLease2",
                "first_year_value":30,
                "consumption_by_end_use_total":170,
                "fluid":{
                    "fluid_type":"fluid_electricity",
                    "fluid_provider":"EDF",
                    "yearly_values":[{...}]
            }
  ###


exports.transform_EndUseGain_kwhef_inEuro = ( opportunity_EndUseData ) ->
  # Go through all endUses
  for endUse in opportunity_EndUseData
    ## For each endUse, calc. the yearly Euro savings in an Array (gain_kwhef_perLease * yearly fuild cost)
    endUse.gain_euro_perLease = []
    for year, year_index in endUse.fluid.yearly_values
      endUse.gain_euro_perLease[year_index] = (endUse.gain_kwhef_perLease * year.cost).toFixed(2)*1;

exports.sum_endUseGains_inEuro = ( opportunity_EndUseData ) ->
  # Get gain_euro_perLease for all endUses in an Array (that we'll sum just after)
  gain_euro_perLease_array = _.map opportunity_EndUseData, (endUse, index) ->
    return endUse.gain_euro_perLease
  # Sum all yearly values to get the total euro Gain for this EndUse
  # In other words: we have the total euro gain, for all Leases concerned, ie. for the Building, for this endUse
  addValuesForArrays gain_euro_perLease_array




exports.getWaterDataFromLeases = (allLeases) ->
  ## When we have an opportinity, we go through all Leases to find the corresponding endUse (in the Lease)
  waterData = []

  # Go through all Leases
  for lease, leaseIndex in allLeases
    # Go through all fluid_consumption_meter of the lease, find Water fluid
    for lease_fluid in lease.fluid_consumption_meter when lease_fluid.fluid_id.indexOf("water") > -1
      lease_fluid.lease_name = lease.lease_name

      # For each Water consumption found, we search for the corresponding Fluid in the conf
      confFluids = Session.get('current_config').fluids
      for fluid in confFluids
        completeFluideName = fluid.fluid_provider + " - " + fluid.fluid_type
        if completeFluideName is lease_fluid.fluid_id
          lease_fluid.fluid = fluid #We store the Fluid in the array

          waterData[leaseIndex] = lease_fluid

  waterData ## return array


# Apply the gain_percent to the Water consumption for all Leases, to get a value in m3
exports.waterGainFromPercent = (waterData, gain_percent) ->
  # Transform percent value in actual m3 water gain
  total = 0
  for water_fluid in waterData
    water_fluid.gain_water_perLease = (water_fluid.first_year_value * gain_percent/100).toFixed(2)*1 ;
    total += water_fluid.gain_water_perLease
  total

# Apply the gain_percent to the Water consumption for all Leases, to get a value in m3
exports.transform_WaterGain_inEuro = ( waterData ) ->
  for water_fluid in waterData
    ## For each water_fluid, calc. the yearly Euro savings in an Array (gain_water_perLease * yearly fuild cost)
    water_fluid.gain_euro_perLease = []
    for year, year_index in water_fluid.fluid.yearly_values when year.year >= d.firstYear
      water_fluid.gain_euro_perLease[year_index] = (water_fluid.gain_water_perLease * year.cost).toFixed(2)*1;

# Sum Euro gains for all Leases
exports.sum_waterGains_inEuro = ( waterData ) ->
  # Get gain_euro_perLease for all Leases in an Array (that we'll sum just after)
  gain_euro_perLease_array = _.map waterData, (water_fluid, index) ->
    return water_fluid.gain_euro_perLease
  # Sum all yearly values to get the total euro Gain for this EndUse
  # In other words: we have the total euro gain, for all Leases concerned, ie. for the Building, for this endUse
  addValuesForArrays gain_euro_perLease_array



# Utility function to sum all Gains
exports.sumAllGains = ( d, gain_operating_cost ) ->
  result = 0
  if d.total_endUseGain_inEuro? then result += d.total_endUseGain_inEuro[0]
  if d.total_waterGain_inEuro? then result += d.total_waterGain_inEuro[0]
  if gain_operating_cost? then result += gain_operating_cost
  result


