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
  $('#sortable').sortable(
    # handle: ".handlerPicto"
    # items: ':not(.static)'
  )
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
  # $('.removeCriterion').click ->
  #   # $(this).remove();
  #   console.log $(this)
  #   console.log $(this).parents('.criterion')[0].remove()
  #   return
  # return

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
  getCriterionToAdd: ->
    return toAddCriterionList
  getCriterion:  ->
    return Template.instance().criterion_list.get()
  displayActions: ->
    if Template.currentData().hasOwnProperty('planned_actions')
      return _.map(@planned_actions, (action) ->
        Actions.findOne action.action_id
      )
    return
