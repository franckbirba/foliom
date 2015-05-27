# Case: building_to_actions > click on a building
@building_to_actions_click_depth1 = (d) ->
  clickedBuilding = Buildings.findOne(
    portfolio_id: Session.get('current_portfolio_doc')._id
    building_name: d.name)
  # Set building session var
  Session.set 'current_building_doc', clickedBuilding
  # Set checkboxes (with timeout, to give the Session time to propagate)
  setTimeout (->
    $('.ActionCheckbox').each ->
      # Look in child Actions if we find a match
      actionID = $(this).val()
      actionExists = Actions.findOne(
        'action_type': 'child'
        'building_id': clickedBuilding._id
        'action_template_id': actionID)
      if actionExists
        $(this).prop 'checked', true
      else
        $(this).prop 'checked', false
  ), 75

# Case: building_to_actions > click on a building
@building_to_actions_click_depth2 = (d) ->
  # find the Action
  actionExists = Actions.findOne(
    'action_type': 'child'
    'building_id': Session.get('current_building_doc')._id
    'name': d.name)
  Session.set 'childActionToEdit', actionExists
  Router.go 'action-form'
