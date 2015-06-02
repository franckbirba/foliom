@correct_autoform_boolean_bug_insert = (doc) ->
  # Correct weird bug in AutoForm for Booleans (returned as string instead of Booleans)
  for item in conformity_information_items
    if doc.conformity_information[item].eligibility is "true"
      doc.conformity_information[item].eligibility = true
      console.log "passed to TRUE!"
    else doc.conformity_information[item].eligibility = false
  return doc

@correct_autoform_boolean_bug_update = (doc) ->
  # Correct weird bug in AutoForm for Booleans (returned as string instead of Booleans)
  for item in conformity_information_items
    selector = "conformity_information.#{item}.eligibility"
    if doc[selector] is "true"
      doc[selector] = true
    else doc[selector] = false
  return doc

@lease_common_hook_before_insert_update = (doc) ->
  # END_USE: Revert first 7 end_uses to their original value
  _.each doc.consumption_by_end_use, (end_use, i) ->
    if i < 7
      doc.consumption_by_end_use[i].end_use_name = endUseList[i]
    return

  # Insert EndUse data in Estate
  leaseEndUses = _.pluck(doc.consumption_by_end_use, 'end_use_name')
  # extract all EndUses from the Lease doc
  currEstate = Estates.findOne(Session.get('current_estate_doc')._id)
  if currEstate.estate_properties and currEstate.estate_properties.endUseList
    estateEndUseList = currEstate.estate_properties.endUseList
  else
    estateEndUseList = []
  # Use union method to keep all unique endUses
  newEndUseList = _.union(estateEndUseList, leaseEndUses)
  Estates.update Session.get('current_estate_doc')._id, { $set: 'estate_properties.endUseList': newEndUseList }, validate: false

  # Insert relevant data in Lease


@isERP = (param) ->
  if param is "" or param is "NA" then false
  else true

@periodicityToMoment = (param) ->
  result = switch
    when param is "monthly" then {months:1}
    when param is "quaterly" then {quarters:1}
    when param is "bi_annual" then {quarters:2}
    when param is "yearly" then {years:1}
    when param is "2_years" then {years:2}
    when param is "5_years" then {years:5}
    when param is "7_years" then {years:7}
    when param is "10_years" then {years:10}

# calc_qualitative_assessment_array
# class must be jQuery selector, eg. ".comformt_QA"
# same for target, eg. '[name=\'comfort_qualitative_assessment.global_comfort_index\']'
@class_to_calc_qualitative_assessment_array = (class_param, target) ->
  array = []
  $(class_param).change =>
    array = $(class_param).get().map( (item) ->
      $(item).val()
    )
    $(target).val(calc_qualitative_assessment_array(array)).change()
  return

# Error monitor: track if the form has any error
# If so: display a small message next to the Submit button
@lease_form_error_monitor = (template) ->
  template.autorun ->
    if !AutoForm.getValidationContext('insertLeaseForm').isValid()
      # Display a warning message (but only once)
      if $('.AF_submit_button').siblings().length == 0
        $('.AF_submit_button').parent().prepend('<div style="text-align:center; color: red;">'+transr("invalid_lease_msg")()+'</div>')

# Hide/show or auto-fill some fields
@leaseFieldRules = (newLease) ->
  # Only display 'rent' if 'rental_status' is 'rented'
  $('[name="rental_status"]').change ->
    hideDependingOnOtherField('rent', $(@).val(), 'rented')
  # Trigger one change at render to hide or show the field
  $('[name="rental_status"]').change()

  # If newLease
  if newLease is true
    # Set the last_significant_renovation to the building creating date
    $('[name="last_significant_renovation"]').val(
      Session.get('current_building_doc').building_info.construction_year
    )
    # If only one lease to create
    if Session.get('nbLeases_2create_onlyOne')
      # lease_name = building_name (and hide field)
      $('[name="lease_name"]').val(
        Session.get('current_building_doc').building_name
      )
      $("[name='lease_name']").parents(".form-group").hide()
      # area_by_usage = building_info.area_useful (and hide field)
      $('[name="area_by_usage"]').val(
        Session.get('current_building_doc').building_info.area_useful
      )
      $("[name='area_by_usage']").parents(".form-group").hide()
      # lease_nb_floors = building_info.building_nb_floors (and hide field)
      $('[name="lease_nb_floors"]').val(
        Session.get('current_building_doc').building_info.building_nb_floors
      )
      $("[name='lease_nb_floors']").parents(".form-group").hide()


@hideDependingOnOtherField = (fieldToHide, sourceValue, sourceCriterion) ->
  if sourceValue isnt sourceCriterion
    $("[name='#{fieldToHide}']").parents(".form-group").hide()
  else
    $("[name='#{fieldToHide}']").parents(".form-group").show()


@alertManager = () ->
  ### ALERTS for conformity_information_items

  conformity_information_items = ['accessibility', 'elevators', 'ssi', 'asbestos', 'lead', 'legionella', 'electrical_installation', 'dpe', 'indoor_air_quality', 'radon', 'chiller_terminal', 'lead_disconnector', 'automatic_doors', 'chiller_system'];

  Alert cases (only to be triggered IF eligibility is true)
  IF (last_diagnostic + periodicity) < today
  OR IF due_date >= last_diagnostic
  OR IF last_diagnostic is empty

  Could have been done with Autoform/ But as of April 2015, the performances of Autoform.getFieldValue() in Autoform5 are way worse than what they used to be in Autoform4. Thus the solution in jQuery.
  ###

  conformity_information_items_div = $('.CiS_block')

  _.each conformity_information_items, (item) ->

    eligibility_selector = '[name="conformity_information.' + item + '.eligibility"]'
    last_diagnostic_selector = '[name="conformity_information.' + item + '.last_diagnostic"]'
    diagnostic_alert_selector = '[name="conformity_information.' + item + '.diagnostic_alert"]'
    periodicity_selector = '[name="conformity_information.' + item + '.periodicity"]'
    due_date_selector = '[name="conformity_information.' + item + '.due_date"]'

    # Monitor 'change' event for all items, on relevant fields
    conformity_information_items_div.on 'change', (eligibility_selector + ',' + last_diagnostic_selector + ',' + periodicity_selector + ',' + due_date_selector), ->

      eligibility = conformity_information_items_div.find(eligibility_selector).prop('checked')
      span_item = $(last_diagnostic_selector).siblings('span')
      # Only trigger alerts if eligibility is true
      if eligibility == true
        last_diagnostic_val = conformity_information_items_div.find(last_diagnostic_selector).val()
        periodicity = conformity_information_items_div.find(periodicity_selector).val()
        due_date = conformity_information_items_div.find(due_date_selector).val()
        last_diagnostic_moment = moment(last_diagnostic_val)
        periodicity_moment = periodicityToMoment(periodicity)
        due_date_moment = moment(due_date)
        today = moment()
        # Apply Alert cases:
        if last_diagnostic_moment.add(periodicity_moment) < today or due_date >= last_diagnostic_val or last_diagnostic_val == null
          warning_text = transr('last_diagnostic_obsolete')
          span_item.text(warning_text).css 'color', 'red'
          $(diagnostic_alert_selector).val true
        else
          # Remove alert and the message
          span_item.text ''
          $(diagnostic_alert_selector).val false
      else
        # Remove alert and the message
        span_item.text ''
        $(diagnostic_alert_selector).val false
    # End of on.change()

    # Trigger a change a first time, so that the Alerts are checked at render
    $('[name^="conformity_information."][name$=".eligibility"]').change()

    return



### Auto-values: used to auto-fill part of the form - for dev. purposes ###
@fillLeaseForm = (activate) ->
  if activate
    # First fields
    $('[name="rental_status"]').val("NA").change()
    $('[name="lease_usage"]').prop('selectedIndex', 1).change()
    $('[name="igh"]').prop('selectedIndex', 1).change()
    $('[name="erp_status"]').prop('selectedIndex', 1).change()
    $('[name="erp_category"]').prop('selectedIndex', 1).change()
    $('[name="headcount"]').val(100)
    $('[name="dpe_type"]').val("housing")
    $('[name="dpe_energy_consuption.grade"]').val("dpe_A")
    $('[name="dpe_energy_consuption.value"]').val(1)
    $('[name="dpe_co2_emission.grade"]').val("dpe_A")
    $('[name="dpe_co2_emission.value"]').val(1)


    # fluid_consumption_meter
    $('[name="fluid_consumption_meter.0.fluid_id"]').val("Lyonnaise des Eaux - fluid_water")
    $('[name="fluid_consumption_meter.1.fluid_id"]').val("EDF - fluid_heat")
    $('[name="fluid_consumption_meter.2.fluid_id"]').val("EDF - fluid_cooling")

    $('[name^=\'fluid_consumption_meter.\'][name$=\'.first_year_value\']').each (index) ->
      $(this).val(randomIntFromInterval(0, 100)).change()
    $('[name^=\'fluid_consumption_meter.\'][name$=\'.yearly_subscription\']').each (index) ->
      $(this).val(randomIntFromInterval(0, 100)).change()

    $('[name^=\'consumption_by_end_use.\'][name$=\'.fluid_id\']').each (index) ->
      $(this).prop('selectedIndex', 3).change()
    $('[name^=\'consumption_by_end_use.\'][name$=\'.first_year_value\']').each (index) ->
      if (index < 6)
        $(this).val(1).change()

    $('[name^=\'consumption_by_end_use.\'][name$=\'.first_year_value\']').each (index) ->
      if (index < 6)
        $(this).val(1).change()

    $('[name="comfort_qualitative_assessment.acoustic"]').prop('selectedIndex', 1).change()
    $('[name="comfort_qualitative_assessment.visual"]').prop('selectedIndex', 1).change()
    $('[name="comfort_qualitative_assessment.thermic"]').prop('selectedIndex', 1).change()


    $('[name^=\'technical_compliance.categories.\'][name$=\'.lifetime\']').each (index) ->
      $(this).val('bad_dvr').change()
    $('[name^=\'technical_compliance.categories.\'][name$=\'.conformity\']').each (index) ->
      $(this).val('compliant').change()



    fakeOptionInput = (name1, name2) ->
      options = $('[name=\'' + name1 + '.0.' + name2 + '\'] option').map(->
        $(this).val()
      )
      $('[name^=\'' + name1 + '.\'][name$=\'.' + name2 + '\']').each (index) ->
        $(this).val options[randomIntFromInterval(1, options.length - 1)]
        return
      return

    # Not necessary since conformity_information is now optionnal
    # $('[name^=\'conformity_information.\'][name$=\'.eligibility\']').each (index) ->
    #   if randomIntFromInterval(0, 1) > 0
    #     $(this).prop('checked', true).change()
    # fakeOptionInput 'conformity_information', 'periodicity'
    # fakeOptionInput 'conformity_information', 'conformity'
    # $('[name^=\'conformity_information.\'][name$=\'.due_date\']').each (index) ->
    #   $(this).val '2015-01-16'
    #   return
    # $('[name^=\'conformity_information.\'][name$=\'.last_diagnostic\']').each (index) ->
    #   $(this).val '2015-01-16'
    #   return
