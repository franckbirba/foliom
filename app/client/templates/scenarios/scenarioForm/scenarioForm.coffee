root = exports ? this

Template.scenarioForm.created = ->
  console.log "@data", @data

  instance = this
  instance.criterion_list = new ReactiveVar([])
  instance.flattend_toAddCriterionList = new ReactiveVar([])

  # Create a flattened version of toAddCriterionList (and without the types)
  flattend_toAddCriterionList = _.chain(toAddCriterionList)
                                .pluck( 'criterion')
                                .flatten()
                                .value()
  # Set reactive vars
  instance.flattend_toAddCriterionList.set(flattend_toAddCriterionList)
  instance.criterion_list.set(@data.scenario.criterion_list)

  # For debug
  instance.tmpActionList = new ReactiveVar([])
  instance.tmpActionList.set([])

  this.autorun ->
    console.log "instance.criterion_list.get()"
    console.log instance.criterion_list.get()

Template.scenarioForm.rendered = ->
  # Init sortable function
  $('#sortable').sortable()

Template.scenarioForm.helpers
  getScenarioLogos: ->
    logoList = ["boat_02", "boat_03", "boat_04", "boat_05", "boat_06", "boat_07", "boat_08", "boat_09"]
    logoList.map (x) ->
      '/icon/scenario_boats/' + x + '.png'
  isChecked: (param) ->
    return param is true
  getOptions: (label) ->
    switch label
      when 'priority_to_techField'
        return buildOptions(technical_compliance_items)
      when 'obsolescence_lifetime_greater_than'
        return buildOptions ["new_dvr", "good_dvr", "average_dvr", "bad_dvr"]
  multipleAttr: ()->
    if this?.multiple is true
      data =
        "multiple":"multiple"
        "size":"3"
      return data
    else return
  isMultiple: ->
    if this?.multiple is true then return true
    else return false
  getCriterionToAdd: ->
    return toAddCriterionList
  getCriterion:  ->
    return Template.instance().criterion_list.get()
  # displayActions: ->
  #   if Template.currentData().hasOwnProperty('planned_actions')
  #     return _.map(@planned_actions, (paction) ->
  #       displayedAction = paction.action
  #       # Format displayedAction.start for display
  #       if paction.start is null then displayedAction.start = "-"
  #       else displayedAction.start = "#{TAPi18n.__ 'quarter_abbreviation'}#{paction.start.format('Q-YYYY')}"

  #       return displayedAction
  #     )
  #   return
  displayStart: (startMoment) ->
    if startMoment is null then return "-"
    else return "#{TAPi18n.__ 'quarter_abbreviation'}#{startMoment.format('Q-YYYY')}"

  display_impact_fluids: ->
    # Return gain kwhef and water - unless there is no water savings
    if @gain_fluids_water[0].or_m3 isnt 0 then return @gain_fluids_kwhef.concat(@gain_fluids_water)
    else return @gain_fluids_kwhef
  getCriterion_priority: (action_id) ->
    action_list = Template.instance().tmpActionList.get()
    action = _.findWhere action_list, _id: action_id
    if action?.criterion_priority then return JSON.stringify(action.criterion_priority)
    else return


Template.scenarioForm.events
  'change #addCriterionSelect': (e) ->
    criterion_list = Template.instance().criterion_list.get()
    flattend_toAddCriterionList = Template.instance().flattend_toAddCriterionList.get()
    criterion = _.where(flattend_toAddCriterionList, label: $(e.currentTarget).val())[0]
    # Add an Id to the criterion, then push it in the list
    criterion.sc_id = giveMeAnId()
    criterion_list.push criterion
    Template.instance().criterion_list.set criterion_list
    # Reset select field
    $(e.currentTarget).val ''
    return
  'click .removeCriterion': (e) ->
    $(e.currentTarget).parents('li').remove()
    return
  'submit form': (e, scenarioForm_template) ->
    e.preventDefault()

    scenario =
      name: $(e.target).find('#scenario_name').val()
      duration: $(e.target).find('#duration').val() * 1
      total_expenditure: $(e.target).find('#total_expenditure').val() * 1
      roi_less_than: $(e.target).find('#roi_less_than').val() * 1
      logo: $(e.target).find('input:radio[name=logo]:checked').val()
    # Get all criterion. First the basic info, then extend with the values
    criterion_list = new Array
    $(e.target).find(".criterionContainer .criterion-label").each () ->
      criterion_list.push {
          label: $(@).attr("true_label"),
          sc_id: $(@).attr("data-sc_id"),
          unit: $(@).attr("unit"),
          type: $(@).attr("type"),
          desc: $(@).attr("desc"),
          }
    $(e.target).find(".criterionContainer :input").each (i) ->
      # set input
      if $(@).is(':checkbox') then val = $(@).is(':checked')
      else val = $(this).val()
      criterion_list[i].input = val
      # add multiple if the attr exists
      criterion_list[i].multiple = true if $(@).attr("multiple") isnt undefined

    current_estate = Session.get('current_estate_doc')
    scenario.criterion_list = criterion_list
    # Template.instance().criterion_list.set criterion_list
    scenario.estate_id = current_estate._id
    # GET BUILDING LIST
    building_list = Template.currentData().buildings
    # RESET SCENARIO.PLANNED_ACTIONS (to the list in @data)
    scenario.planned_actions = Template.currentData().action_list

    # Aplly criterion and sort
    scenario = criterionCalc(scenario, building_list)


    # @BSE - temp : display in array
    Template.instance().tmpActionList.set(scenario.planned_actions)
    # console.log "AFTER CRITERION - scenario.planned_actions is now ", scenario.planned_actions

    # FORMAT planned_actions to just the _id and start date
    scenario.planned_actions = _.map(scenario.planned_actions, (paction) ->
      action=
        action_id: paction.action._id
        start: if paction.start is null then null else paction.start.toDate()
      )

    console.log "scenario", scenario

    curr_scenario_id = scenarioForm_template?.data?.scenario._id # Get the Scenario Id if it exists
    if curr_scenario_id
      # UPDATE
      Scenarios.update curr_scenario_id, $set:
        name: scenario.name
        duration: scenario.duration
        total_expenditure: scenario.total_expenditure
        roi_less_than: scenario.roi_less_than
        logo: scenario.logo
        criterion_list: scenario.criterion_list
        planned_actions: scenario.planned_actions
      #Re-render template to make sure everything is in order - @BSE: can be deleted at some point
      # Router.go 'scenario-form', _id: curr_scenario_id
    else
      # INSERT
      newScenario_id = Scenarios.insert(scenario)
      #Re-render template and go to UPDATE form
      Router.go 'scenario-form', _id: newScenario_id


