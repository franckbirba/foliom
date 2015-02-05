# initActionObject = () ->

exports = this

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
  ## Go through all endUses
  for endUse in opportunity_EndUseData
    ## For each endUse, calc. the yearly Euro savings in an Array (gain_kwhef_perLease * yearly fuild cost)
    endUse.gain_euro_perLease = []
    for year, year_index in endUse.fluid.yearly_values
      endUse.gain_euro_perLease[year_index] = (endUse.gain_kwhef_perLease * year.cost).toFixed(2)*1;

exports.sum_endUseGains_inEuro = ( opportunity_EndUseData ) ->
  ## Get gain_euro_perLease for all endUses in an Array (that we'll sum just after)
  gain_euro_perLease_array = _.map opportunity_EndUseData, (endUse, index) ->
    return endUse.gain_euro_perLease
  # Sum all yearly values to get the total euro Gain for this EndUse
  # In other words: we have the total euro gain, for all Leases concerned, ie. for the Building, for this endUse
  addValuesForArrays gain_euro_perLease_array

###
_.each(allEndUseData[index], function(endUse, tmp_index) {
  // For this endUse, create yearly values for in_kwhef
  var impact_assessment_euro = [];

  _.each(endUse.fluid.yearly_values, function(year, year_index) {

      //For each year, calc the euro reduction : gain_kwhef_perLease * yearly fuild cost
      impact_assessment_euro[year_index] = (endUse.gain_kwhef_perLease * year.cost).toFixed(2)*1;

      //We also create the sum in the yearly_savings array
      var yearly_total = (yearly_savings[year_index].euro_savings + impact_assessment_euro[year_index]).toFixed(2)*1;

      yearly_savings[year_index] = {
          "year": year.year,
          "euro_savings": yearly_total
      };

      //@BSE : test to have a simple array
      yearly_savings_complete[year_index] = yearly_total;

  });
  endUse.gain_fluids_kwhef = impact_assessment_euro;
});
###
