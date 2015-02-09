###
This function is designed to apply all calculus that an Action needs in the following cases
- Applying an Action from the tree
- ToDo: Moving an Action in the Timeline
###

exports = this

exports.actionCalc = (actionId, firstYear) ->
  action = Actions.findOne(actionId)

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

  # Do same calc for water

  console.log "action is"
  console.log action

  # Update Action in DB
  Actions.update {_id: action._id}, $set:
    "gain_fluids_kwhef": action.gain_fluids_kwhef
    "gain_fluids_water": action.gain_fluids_water
    "gain_operating": action.gain_operating
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
