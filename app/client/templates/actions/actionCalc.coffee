###
This function is designed to apply all calculus that an Action needs in the following cases
- Applying an Action from the tree
- ToDo: Moving an Action in the Timeline
###

exports = this

exports.actionCalc = (actionId) ->
  action = Actions.findOne(actionId)

  # init phase with some vars
  allLeases = Leases.find(
                {building_id:Session.get('current_building_doc')._id},
                {sort: {lease_name:1}}
            ).fetch();
  allEndUseData = []
  all_yearly_savings_simplyValues = []

  for opportunity, index in action.gain_fluids_kwhef
    #For each line, we find the matching EndUse in the Lease(s). This is why we have an array: one cell per lease.
    allEndUseData[index] = getMatchingEndUseInLease(allLeases, opportunity.opportunity);

    #Calc the kwhef gain from the % val.
    #@BSE: update with the new calc

    if opportunity.per_cent?
      in_kwhef = 0
      # allEndUseData[index] contains all that we need - we're still in the loop that applies to each line
      # We go through each endUse and sum the percent*EndUse_consumption
      _.each allEndUseData[index], (endUse) ->
          #We also save the result (per Lease) in EndUse
          endUse.gain_kwhef_perLease = (endUse.first_year_value * opportunity.per_cent/100)
          in_kwhef += endUse.gain_kwhef_perLease

      #Now set the in_kwhef val
      opportunity.or_kwhef = in_kwhef.toFixed(2)*1

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
