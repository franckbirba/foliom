###
This function is designed to apply all calculus that an Action needs in the following cases
- Applying an Action from the tree
- ToDo: Moving an Action in the Timeline
###

exports = this

exports.actionCalc = (actionId, firstYear) ->
  action = Actions.findOne(actionId)
  # building = Builings.findOne(action.building_id, {})
  building_area_search = Buildings.findOne(action.building_id, {fields: {'building_info.area_total':1}}) # Only get the building area, to optimize performance
  building_area = building_area_search.building_info.area_total
  console.log "building_area is #{building_area}"


  ao = new ActionObject(firstYear); # init phase with some vars
  d = {}; # Not sure this is still useful

  for opportunity, index in action.gain_fluids_kwhef
    #For each line, we find the matching EndUse in the Lease(s). This is why we have an array: one cell per lease.
    # allEndUseData[index] = getMatchingEndUseInLease(allLeases, opportunity.opportunity);
    ao.getMatchingEndUseInLease(index, opportunity.opportunity);

    #Calc the kwhef gain from the % val.
    if opportunity.per_cent?
      #Calc the Gain in kWhef and set the value
      kwhef_gain = ao.kWhEFGainFromPercent(index, opportunity.per_cent);
      opportunity.or_kwhef = kwhef_gain.toFixed(2)*1

    #if opportunity.or_kwhef?
      #ToDo: add inverse calc.

    # Calc euro gain
    ao.transform_EndUseGain_kwhef_inEuro(index)
    # Calc total savings by adding the savings of each endUse, then set the (first) value in Euro field
    total_endUseGain_inEuro = ao.sum_endUseGains_inEuro ( index )
    opportunity.yearly_savings = total_endUseGain_inEuro[0]

  # Water calc
    for opportunity, index in action.gain_fluids_water
      #Calc the m3 gain from the % val.
      if opportunity.per_cent?
        # Calc the Gain in m3 and set the value
        opportunity.or_m3 = ao.waterGainFromPercent(opportunity.per_cent)

      if opportunity.per_cent? # OR opportunity.or_m3
        # Calc the Gain in Euro and set the value
        ao.transform_WaterGain_inEuro()
        d.total_waterGain_inEuro = ao.sum_waterGains_inEuro()
        opportunity.yearly_savings = d.total_waterGain_inEuro[0]


  # Other form formula

  # Operating ratio and cost
  if action.gain_operating.ratio?
    curr_field = action.gain_operating.ratio
    source = building_area
    estimate = (curr_field * source).toFixed(2) *1
    action.gain_operating.cost = estimate
    console.log "action.gain_operating.cost is #{action.gain_operating.cost}"
  else if action.gain_operating.cost?
    curr_field = action.gain_operating.cost
    source = building_area
    estimate = (curr_field * source).toFixed(2) *1
    action.gain_operating.cost = estimate

  # savings_first_year.fluids.euro_peryear
  total_savings_array = addValuesForArrays(ao.gain.kwhef_euro)
  action.savings_first_year =
    fluids:
      euro_peryear: total_savings_array[0]



  console.log "action is"
  console.log action

  # Update Action in DB
  Actions.update {_id: action._id}, $set:
    "gain_fluids_kwhef": action.gain_fluids_kwhef
    "gain_fluids_water": action.gain_fluids_water
    "gain_operating": action.gain_operating
    "savings_first_year": action.savings_first_year
    "investment": action.investment

###
{
    "name" : "Désembouage des réseaux",
    "logo" : "&#58947;",
    "gain_fluids_kwhef" : [
        {
            "opportunity" : "end_use_heating",
            "per_cent" : 1
        }
    ],
    "gain_fluids_water" : [
        {
            "opportunity" : "fluid_water",
            "per_cent" : 0
        }
    ],
    "project_type" : "cr",
    "technical_field" : "thermal_delivery",
    "feasable_while_occupied" : "yes",
    "priority" : "high",
    "other_gains" : {
        "technical_compliance_a" : "NA",
        "regulatory_compliance" : "no",
        "residual_lifetime" : "no"
    },
    "design_duration" : 1,
    "works_duration" : 1,
    "action_lifetime" : 3,
    "investment" : {
        "ratio" : 2
    },
    "raw_roi" : 0,
    "actualised_roi" : 0,
    "value_analysis" : 0,
    "lec" : 0,
    "internal_return" : 0,
    "action_type" : "child",
    "estate_id" : "jRvd9WYeegTPtXRTZ",
    "building_id" : "25bQcnwe2RZHdjsu5",
    "action_template_id" : "RxdPn5wmN5YKoPqqM",
    "_id" : "DAkm4BYryLx4AePpw"
}
###
