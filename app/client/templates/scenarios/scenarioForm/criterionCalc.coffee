@criterionCalc = (scenario) ->
  unplanned_actions = new Array

  # Preliminary - apply the default sort: by internal_return
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
            if 0 <= item.global_lifetime <= 0.25 then return 4
            else if 0.25 < item.global_lifetime <= 0.5 then return 3
            else if 0.5 < item.global_lifetime <= 0.75 then return 2
            else if 0.75 < item.global_lifetime <= 1 then return 1
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
              action.criterion_priority[priority] = key * 1
        # Increment priority index
        priority++
        break


      when 'priority_to_techField'
        actions = []
        # For each input, find the Actions that target this Technical field
        for input in criterion.input
          # actions = _.where scenario.planned_actions.technical_field, {building_id: building._id}
          actions.push _.filter scenario.planned_actions, (obj) ->
                # return _.where(obj.technical_field, input).length >0
                tmp_array = _.filter obj.technical_field, (item)->
                  return item is input
                return tmp_array.length >0
        # Flatten resulting array
        actions = _.flatten(actions)
        # console.log "found actions: ", actions

        # Keep action Ids
        actions_Ids = _.pluck(actions, '_id')
        # Set priority in scenario.planned_actions
        for paction in scenario.planned_actions
          # If the planned action's Id is in the actions_Ids array: we give it priority (1), otherwise it's not prioritary (thus a priority of 2)
          if _.contains(actions_Ids, paction._id) then paction.criterion_priority[priority] = 1
          else paction.criterion_priority[priority] = 2
        # Increment priority index
        priority++
        break

    return

  # ---- SORTING -----

  orderArrayByCriterion = (action_array, iterator, limit) ->
    for key, array of action_array
      action_array[key] = _.groupBy array, (item)->
        return item.criterion_priority["#{iterator}"]
      # console.log "ordered_actions are NOW: ", action_array
      if iterator < limit
        orderArrayByCriterion(action_array[key], iterator+1, limit)
      else
        # INSERT FINAL SORTING HERE @BSE

  # Do the first sort manually, to initiate the object structure
  # result will be in the form of: Object {1: Array[4], 2: Array[9]}
  ordered_actions =  _.groupBy scenario.planned_actions, (item)->
    return item.criterion_priority["0"]
  # Launch recursive sorting - but only if there is more than one criterion
  if scenario.criterion_list.length > 1
    orderArrayByCriterion(ordered_actions, 1, scenario.criterion_list.length-1)
  console.log "FINISHED RECURSION! ", ordered_actions


  # Flatten sorted actions
  scenario.planned_actions = flattenSortedActions(ordered_actions, criterion_list.length)


  # TOTAL EXPENDITURE FILTER: set action.start to null if we are over budget
  added_action_cost = 0
  _.each scenario.planned_actions, (paction)->
    added_action_cost += paction.action.subventions.residual_cost
    if added_action_cost > scenario.total_expenditure
      paction.start = null


  # Add the unplanned actions at the end of the planned_actions
  scenario.planned_actions = scenario.planned_actions.concat(unplanned_actions)

  return scenario



@flattenSortedActions = (object, criterion_list_length)->
  i = 0
  result = _.flatten(object)
  while i < criterion_list_length-1
    result = _.chain(result).map((item)-> _.flatten(item)).flatten().value()
    i++
    # console.log "tmp result is ", result
  return result
