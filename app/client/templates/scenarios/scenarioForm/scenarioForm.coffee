Template.scenarioForm.created = ->
  instance = this
  instance.criterion_list = new ReactiveVar([])
  instance.flattend_toAddCriterionList = new ReactiveVar([])

  # Create a flattened version of toAddCriterionList (and without the types)
  flattend_toAddCriterionList = _.chain(toAddCriterionList)
                                .pluck( 'criterion')
                                .flatten()
                                .value()
  instance.flattend_toAddCriterionList.set(flattend_toAddCriterionList)

  # If editing a scenario : criterion list exists. Otherwise it's a new scenario => use an empty array
  if @data.criterion_list?
    instance.criterion_list.set(@data.criterion_list)
  else
    instance.criterion_list.set([])

  console.log instance.criterion_list.get()

  this.autorun ->
    console.log "instance.criterion_list.get()"
    console.log instance.criterion_list.get()

Template.scenarioForm.rendered = ->
  curr_scenario = @data
  # Init sortable function
  $('#sortable').sortable()

Template.scenarioForm.helpers
  getScenarioLogos: ->
    logoList = ["boat_02", "boat_03", "boat_04", "boat_05", "boat_06", "boat_07", "boat_08", "boat_09"]
    logoList.map (x) ->
      '/icon/scenario_boats/' + x + '.png'
  isChecked: (param) ->
    return param is true
  getTechnical_compliance_items: ->
    result = _.map technical_compliance_items, (item) ->
      return { label: item, value: item }
    return result
  getCriterionToAdd: ->
    return toAddCriterionList
  getCriterion:  ->
    return Template.instance().criterion_list.get()
  displayActions: ->
    if Template.currentData().hasOwnProperty('planned_actions')
      return _.map(@planned_actions, (action) ->
        displayedAction = Actions.findOne action.action_id
        displayedAction.start = "Q#{moment(action.start).quarter()} #{moment(action.start).year()}"
        return displayedAction
      )
    return

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
    $(e.target).find(".criterionContainer .criterion-label").each () ->
      criterion_list.push {
          label: $(this).attr("true_label"),
          sc_id: $(this).attr("data-sc_id"),
          unit: $(this).attr("unit"),
          type: $(this).attr("type"),
          desc: $(this).attr("desc"),
          }
    $(e.target).find(".criterionContainer :input").each (i) ->
      if $(@).is(':checkbox') then val = $(@).is(':checked')
      else val = $(this).val()
      criterion_list[i].input = val
      item = criterion_list[i]
    # console.log "criterion list is ", criterion_list
    current_estate = Session.get('current_estate_doc')
    scenario.criterion_list = criterion_list;
    scenario.estate_id = current_estate._id
    # If the scenario does not already have a planned_actions array: instantiate it
    if !(scenario.planned_actions instanceof Array) then scenario.planned_actions = []

    # CREATE BUILDING LIST AND ACTION LIST (for the Estate, ie. all Portfolios in the Estate)
    building_list = _.chain(current_estate.portfolio_collection)
                      .map ((portfolio_id) ->
                        Buildings.find({ portfolio_id: portfolio_id }, {fields: {properties: 0}}).fetch()
                      )
                      .flatten()
                      .value()

    planActionsForBuilding = (id_param) ->
      # get all child Actions for this Building
      action_list = Actions.find({
        'action_type': 'child'
        'building_id': id_param
      }, sort: name: 1).fetch()
      # Go through all Actions and push them to the planned_actions array
      _.each action_list, (action) ->
          # A la fin, il ne faudra garder que l'id et start
          action.start = new Date
          scenario.planned_actions.push action
        # scenario.planned_actions.push
        #   action_id: action._id
        #   start: new Date
          # savings_first_year_fluids_euro_peryear: action.savings_first_year.fluids.euro_peryear //@BSE: FROM HERE
          # Si non plannifié : mettre start à null
        return
      return

    _.each building_list, (item) ->
      planActionsForBuilding item._id
      return

    #SORT ACTIONS
    #Default sort
    scenario.planned_actions = _.sortBy(scenario.planned_actions, (item) ->
      item.internal_return
      #sortBy ranks in ascending order (use a - to change order)
    )
    #For each Criterion
    _.each scenario.criterion_list, (criterion) ->
      switch criterion.label
        when 'yearly_expense_max'
          console.log "yearly_expense_max: #{criterion.input}"
          break
        when 'priority_to_techField'
          console.log "priority_to_techField: #{criterion.input}"
          break

      return

    # return planned_actions to usable state
    scenario.planned_actions = _.map(scenario.planned_actions, (item) ->
      action=
        action_id: item._id
        start: item.start
      )

    console.log "scenario", scenario
    curr_scenario_id = scenarioForm_template?.data?._id # Get the Scenario Id if it exists

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
      Router.go 'scenario-form', _id: curr_scenario_id
    else
      # INSERT
      newScenario_id = Scenarios.insert(scenario)
      #Re-render template to go to EDIT mode
      Router.go 'scenario-form', _id: newScenario_id


