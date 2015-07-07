###
This function is designed to apply all calculus that an Action needs in the following cases
- Applying an Action from the tree
- ToDo: Moving an Action in the Timeline
###

@actionCalc = (actionId, firstYear, building_id, scenario_year) ->

  # INIT
  action = Actions.findOne(actionId)
  # building = Builings.findOne(action.building_id, {})
  building_area_search = Buildings.findOne(action.building_id, {fields: {'building_info.area_total':1}}) # Only get the building area, to optimize performance
  building_area = building_area_search.building_info.area_total

  ao = new ActionObject(firstYear); # init phase with some vars
  # ao = new ActionObject(firstYear, Session.get('current_building_doc')._id, 2014);


  # KWHEF GAIN
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


  # WATER GAIN
    for opportunity, index in action.gain_fluids_water
      #Calc the m3 gain from the % val.
      if opportunity.per_cent?
        # Calc the Gain in m3 and set the value
        opportunity.or_m3 = ao.waterGainFromPercent(opportunity.per_cent)

      if opportunity.per_cent? # OR opportunity.or_m3
        # Calc the Gain in Euro and set the value
        ao.transform_WaterGain_inEuro()
        total_waterGain_inEuro = ao.sum_waterGains_inEuro()
        opportunity.yearly_savings = total_waterGain_inEuro[0]


  # Other GAIN formula

  # Operating ratio and cost
  if action.gain_operating
    if action.gain_operating.ratio?
      curr_field = action.gain_operating.ratio
      source = building_area
      estimate = (curr_field * source).toFixed(2) *1
      action.gain_operating.cost = estimate
      # console.log "action.gain_operating.cost is #{action.gain_operating.cost}"
    else if action.gain_operating.cost?
      curr_field = action.gain_operating.cost
      source = building_area
      estimate = (curr_field / source).toFixed(2) *1
      action.gain_operating.ratio = estimate
  else
    action.gain_operating =
      cost:0
      ratio:0


  # savings_first_year.fluids.euro_peryear
  total_fluid_savings_a = ao.sum_all_fluids_inEuro(ao.gain.kwhef_euro, ao.gain.water_euro);
  action.savings_first_year =
    fluids:
      euro_peryear: total_fluid_savings_a[0]

  # operating_total_gain
  operating_total_gain_cost = action.gain_operating.cost + total_fluid_savings_a[0] #cost
  operating_total_gain_ratio = (operating_total_gain_cost / building_area).toFixed(2)*1 #ratio
  action.operating_total_gain =
    cost: operating_total_gain_cost
    ratio: operating_total_gain_ratio


  # INVESTMENTS

  # Investment ratio and cost
  source = building_area
  if action.investment.ratio?
    curr_field = action.investment.ratio
    estimate = (curr_field * source).toFixed(2) *1
    action.investment.cost = estimate
    console.log "action.investment.cost is #{action.investment.cost}"
  else if action.investment.cost?
    curr_field = action.investment.cost
    estimate = (curr_field / source).toFixed(2) *1
    action.investment.ratio = estimate

  # Subventions: ratio and cost in Euro
  source = action.investment.cost
  if action.subventions
    if action.subventions.ratio isnt 0
      curr_field = action.subventions.ratio
      estimate = (curr_field/100 * source).toFixed(2) *1
      action.subventions.or_euro = estimate
    else if action.subventions.or_euro?
      curr_field = action.subventions.or_euro
      estimate = (curr_field*100 / source).toFixed(2) *1
      action.subventions.ratio = estimate

    # Subventions: residual cost
    result = action.investment.cost - action.subventions.or_euro - action.subventions.CEE_opportunity
    action.subventions.residual_cost = result

  else # no subs >> residual cost is the investment
    action.subventions =
      residual_cost: action.investment.cost


  # EFFICIENCY
  action.raw_roi = ao.calc_raw_roi(action.subventions.residual_cost, total_fluid_savings_a[0], action.gain_operating.cost);

  action.value_analysis = ao.calc_value_analysis(action.action_lifetime, action.subventions.residual_cost);

  ao.prepare_investment_arrays(action.action_lifetime, action.subventions.residual_cost)
  ao.actualize_merged_fluids_euro()
  ao.prepare_operatingSavings_arrays(action.action_lifetime, action.gain_operating.cost)
  ao.prepare_flux_arrays()

  action.internal_return = ao.calc_IRR()

  action.actualised_roi = ao.calc_TRA()

  action.lec = ao.calc_LEC(action.action_lifetime)


  console.log 'action is', action
  console.log ao

  # Update Action in DB
  Actions.update {_id: action._id}, $set:
    gain_fluids_kwhef: action.gain_fluids_kwhef
    gain_fluids_water: action.gain_fluids_water
    gain_operating: action.gain_operating
    savings_first_year: action.savings_first_year
    operating_total_gain: action.operating_total_gain
    investment: action.investment
    subventions: action.subventions
    raw_roi: action.raw_roi
    value_analysis: action.value_analysis
    internal_return: action.internal_return
    actualised_roi: action.actualised_roi
    lec: action.lec

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
