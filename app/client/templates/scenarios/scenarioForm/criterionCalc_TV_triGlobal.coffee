
@calcTV = (scenario, building_list, portfolios)->
  # Get actions that matches the Ids in the Scenario
  pactions = scenario.planned_actions
  actionIds = _.pluck pactions, '_id'
  actions = (Actions.find  _id: $in: actionIds).fetch()
  # Denormalize actions in the scenario and transform start date as moment
  for paction in pactions
    paction.action = _.findWhere actions, _id: paction._id
    # paction.start = moment paction.start unless paction.start is null
  # Init TV
  TV = TimelineVars
  TV.reset()
  # Get denormalized scenario, buildings and portfolios
  TV_data =
    scenario: scenario
    buildings: building_list
    portfolios: portfolios
  TV.getRouterData(TV_data)
  # Set minimum and maximum date
  TV.setMinMaxDate()
  # Get fluids and coefficients
  TV.getFluidsAndCoefs()
  # Create ticks, consumption and budget charts
  TV.calculateStaticCharts()
  # Calc
  TV.calculateTimelineTable()
  TV.calculateDynamicChart()

  return TV.triGlobal


# > Si le TRI global (voir infossur le calcul des gains globaux d’un scénario ≠ somme des gains unitaires des actions) de ce panel d’actions est inférieur au TRI autorisé, tout va bien et on passe à la suite.
# > Si le TRI global de ce panel d’actions est supérieur au TRI autorisé, on retire l’action la plus bas dans la liste dont le TRI unitaire est > au TRI global, et on refait le calcul. Si ça ne marche toujours pas rebelote (ça ne sert à rien d’enlever les actions en bas de liste, dont le TRI est < au TRI global : le calcul du TRI global ne sera pas amélioré).
@remove_actions_to_improve_TRI = (scenario, building_list, portfolios, tri_global) ->
  # console.log "tri_global ", tri_global
  if tri_global > scenario.roi_less_than
    index = scenario.planned_actions.length - 1
    while tri_global > scenario.roi_less_than
      # Find lowest ranking action whose TRI is > tri_global
      curr_action = scenario.planned_actions[index]
      # console.log "index, action", index, curr_action
      if curr_action.start isnt null and curr_action.internal_return > tri_global
        # console.log "FOUND ACTION: ", curr_action.name
        tri_global = calcTV(scenario, building_list, portfolios)
        # Check if tri_global passes the test. Otherwise: remove action and decrement index
        if tri_global > scenario.roi_less_than
          curr_action.start = null
          index--
      else index--
      # console.log "tri_global ", tri_global

      # For safety: break if index is 0
      if index is 0
        break
