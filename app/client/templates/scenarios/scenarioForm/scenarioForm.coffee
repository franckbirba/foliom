Template.scenarioForm.rendered = ->
  curr_scenario = @data

  # Init sortable function
  $('#sortable').sortable()
  $('#sortable').disableSelection()

  # If we're editing a Scenario (eg. this.data isn't false)
  if curr_scenario
    $('#scenario_name').val curr_scenario.name
    $('#duration').val curr_scenario.duration
    $('#total_expenditure').val curr_scenario.total_expenditure
    $('#roi_less_than').val curr_scenario.roi_less_than
    #Set techField if it exists >> @BSE: make it work for several techFields
    _.each curr_scenario.criterion_list, (criterion) ->
      if criterion.label == 'priority_to_techField'
        $('#addTechfield').val criterion.input
      return

  #Remove item on click
  $('.removeCriterion').click ->
    # $(this).remove();
    console.log $(this)
    console.log $(this).parents('.criterion')[0].remove()
    return
  return

Template.scenarioForm.helpers
  getScenarioLogos: ->
    logoList = ["boat_02", "boat_03", "boat_04", "boat_05", "boat_06", "boat_07", "boat_08", "boat_09"]
    logoList.map (x) ->
      '/icon/scenario_boats/' + x + '.png'
  isChecked: (param) ->
    # return (param === "checked");
    param == 'checked'
  getTechnical_compliance_items: ->
    result = _.map technical_compliance_items, (item) ->
      return { label: item, value: item }
    return result
  getCriterion: (toAdd) ->
    toAddCriterionList = [
            {"label": "yearly_expense_max", "unit": "u_euro_year", "weight": 0},
            {"label": "energy_consum_atLeast_in_E_year", "unit": "u_percent", "weight": 0},
            {"label": "wait_for_obsolescence", "type":"checkbox", "desc": "wait_for_obsolescence_desc", "weight": 0},
            {"label": "priority_to_gobal_obsolescence", "type":"checkbox", "desc": "priority_to_gobal_obsolescence_desc", "weight": 0},
            {"label": "priority_to_techField", "type":"selector_techfield", "weight": 0}
            ]
    if toAdd is 'toAdd'
      return toAddCriterionList

    curr_scenario = Template.currentData()
    current_criterion_list = []

    if curr_scenario.hasOwnProperty('criterion_list')
      current_criterion_list = curr_scenario.criterion_list
    else
      current_criterion_list = toAddCriterionList
    console.log 'current_criterion_list', current_criterion_list
    current_criterion_list

  displayActions: ->
    if Template.currentData().hasOwnProperty('planned_actions')
      return _.map(@planned_actions, (action) ->
        Actions.findOne action.action_id
      )
    return
