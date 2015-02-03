# initActionObject = () ->

exports = this

exports.getMatchingEndUseInLease = (allLeases, matchingEndUse) ->
  ## When we have an opportinity, we go through all Leases to find the corresponding endUse (in the Lease)
  ## Note: could be better with a "break" when the EndUse is found

  matchingEndUseInLease = []

  for lease, leaseIndex in allLeases
    for endUse in lease.consumption_by_end_use when endUse.end_use_name is matchingEndUse
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
