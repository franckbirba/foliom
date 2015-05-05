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
  displayActions: ->
    console.log this
    if Template.currentData().hasOwnProperty('planned_actions')
      return _.map(@planned_actions, (paction) ->
        displayedAction = paction.action
        # Format displayedAction.start for display
        if paction.start is null then displayedAction.start = "-"
        else displayedAction.start = "#{TAPi18n.__ 'quarter_abbreviation'}#{paction.start.format('Q-YYYY')}"

        return displayedAction
      )
    return
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
    # remove li element from the list
    $(e.currentTarget).parents('li').remove()
    # criterion_list =Template.instance().criterion_list.get();
    # criterion = _.where(criterion_list, {sc_id:this.sc_id})[0];
    # console.log("found criterion in criterion_list: ", criterion);
    # criterion_list = _.without(criterion_list, criterion); // Remove criterion from list
    # console.log("criterion is now: ", criterion_list);
    # Template.instance().criterion_list.set(criterion_list);
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
    unplanned_actions = new Array
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

    console.log "scenario.planned_actions is now ", scenario.planned_actions





    #SORT ACTIONS
    #Default sort
    scenario.planned_actions = _.sortBy(scenario.planned_actions, (paction) ->
      paction.action.internal_return
      #sortBy ranks in ascending order (use a - to change order)
    )
    # Go through each Criterion, find relevant Actions, and apply priority
    priority = 0
    _.each scenario.criterion_list, (criterion) ->
      switch criterion.label
        when 'yearly_expense_max'
          # Go through all Actions, and add 1 Year if the yearly expense is above the criterion input
          yearly_sum = 0
          nb_toAdd = 0
          _.each scenario.planned_actions, (paction)->
            yearly_sum += paction.action.subventions.residual_cost
            if yearly_sum > criterion.input
              yearly_sum = paction.action.subventions.residual_cost # reset cost to current cost
              nb_toAdd++ #increment counter
            paction.start.add nb_toAdd, 'Y'
          break
        when 'obsolescence_lifetime_greater_than'
          _.each scenario.planned_actions, (paction, index)->
            tech_fields = paction.action.technical_field
            building = _.findWhere building_list, _id: paction.action.building_id
            allLeases = Leases.find({building_id: building._id}).fetch()
            # For each tech_field, look for the match in all Leases. When a match is found, look if it's enough to disqualify the Action
            for tech_field in tech_fields
              for lease in allLeases
                if isLifetimeGreaterOrEqual(lease.technical_compliance.categories[tech_field].lifetime, criterion.input) is true
                  paction.start = null
                  unplanned_actions = unplanned_actions.concat scenario.planned_actions.splice(index, 1)
                  breakLoop1 = true; break
              break if breakLoop1
          break
        when 'priority_to_gobal_obsolescence'
          # Increment priority index
          priority++
          # Create ordered_buildings list: order them based on global_lifetime
          ordered_buildings = \
            _.chain(building_list)
            .map( (item)->
              return {
                'building_name': item.building_name
                '_id': item._id
                'global_lifetime':item.properties.leases_averages.technical_compliance.global_lifetime
              })
            .groupBy( (item)->
              # The higher the global_lifetime index, the worse DVR (lifetime) the equipement has
              # NOTE: in terms of priority, a lower value means that the action is more important
              if 0 <= item.global_lifetime <= 0.25
                return 4
              else if 0.25 < item.global_lifetime <= 0.5
                return 3
              else if 0.5 < item.global_lifetime <= 0.75
                return 2
              else if 0.75 < item.global_lifetime <= 1
                return 1
            )
            .value()
          # console.log "ordered_buildings ", ordered_buildings

          # Apply priority to Actions
          for key, value of ordered_buildings
            console.log key, value
            for building in value
              actions = _.where scenario.planned_actions, {building_id: building._id}
              for action in actions
                # Set priority
                action.criterion_priority[priority] = key
          console.log "scenario.planned_actions is now ", scenario.planned_actions
          debugger

          # NOW SORT @BSE - rework here
          # scenario.planned_actions = _.sortBy(scenario.planned_actions, (paction) ->
          #   paction.criterion_priority[1]
          #   #sortBy ranks in ascending order (use a - to change order)
          # )

          break
        when 'priority_to_techField'
          console.log "priority_to_techField: #{criterion.input}"
          # Increment priority index
          priority++
          actions = []
          # For each input, find the Actions that target this Technical field
          for input in criterion.input
            # actions = _.where scenario.planned_actions.technical_field, {building_id: building._id}
            actions.push _.filter scenario.planned_actions, (obj) ->
                return _.where(obj.technical_field, input).length >0
          # Flatten resulting array
          actions = _.flatten(actions)
          console.log "found actions: ", actions
          # Keep action Ids
          actions_Ids = _.pluck(actions, '_id')
          # Set priority in scenario.planned_actions
          for paction in scenario.planned_actions
            # If the planned action's Id is in the actions_Ids array: we give it priority (1), otherwise it's not prioritary (thus a priority of 2)
            if _.contains(actions_Ids, paction._id) then paction.criterion_priority[priority] = 1
            else paction.criterion_priority[priority] = 2

          console.log "scenario.planned_actions is now ", scenario.planned_actions
          debugger

          break

      return

    # @BSE - temp : display in array
    Template.instance().tmpActionList.set(scenario.planned_actions)
    # NOW SORT @BSE - rework here (for now, only using the first criterion_priority)
    scenario.planned_actions = _.sortBy(scenario.planned_actions, (paction) ->
      paction.criterion_priority[1]
      #sortBy ranks in ascending order (use a - to change order)
    )

    # TOTAL EXPENDITURE FILTER: set action.start to null if we are over budget
    added_action_cost = 0
    _.each scenario.planned_actions, (paction)->
      added_action_cost += paction.action.subventions.residual_cost
      if added_action_cost > scenario.total_expenditure
        paction.start = null


    # Add the unplanned actions at the end of the planned_actions
    scenario.planned_actions = scenario.planned_actions.concat(unplanned_actions)
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


