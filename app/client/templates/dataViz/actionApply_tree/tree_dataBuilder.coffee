# Create Building list, and for each building get the Actions.
# Returns an object already formatted correctly for the Tree
@calcBuildingToActionData = () ->
  # Get all relevant Buildings
  building_list = Buildings.find({portfolio_id: Session.get('current_portfolio_doc')._id },
                              {sort: {name:1}}
                              ).fetch()

  # Get all relevant Actions
  action_list = _.map building_list, (building) ->
    Actions.find({ # Get all child actions
            "action_type":"child",
            "building_id": building._id
          },
          {sort: {name:1}}
          ).fetch()
  grouped_action_list = _.chain(action_list)
                          .flatten()
                          .groupBy( (action) -> action.name )
                          .value()

  # Init Data object
  data =
    building_to_actions: []
    actions_to_buildings: []

  # For each Building, create the Action List
  data.building_to_actions = _.map(building_list, (item) ->
            return {
                  "name": item.building_name,
                  "id": item._id,
                  "children": getActionsForBuilding(item._id)
                }
          )

  data.actions_to_buildings = _.map(grouped_action_list, (item, key) ->
            return {
                  "name": key,
                  "id": item[0].action_template_id, # Use action_template_id as Id
                  "children": []
                }
          )

  data # Return all the Data

# Method to get all Actions for Each building + build a children list for the Tree
getActionsForBuilding = (id_param) ->
  return Actions.find({ # First get all child actions
            "action_type":"child",
            "building_id": id_param
          },
          {sort: {name:1}}
          ).fetch()
          # then map it to a format that the tree can use
          .map( (item) ->
            return {"name": item.name}
          )


# Create Action list, and for each building get the Actions.
# Returns an object already formatted correctly for the Tree
# @calcBuildingToActionData = () ->
#   building_list = Buildings.find({portfolio_id: Session.get('current_portfolio_doc')._id },
#                               {sort: {name:1}}
#                               ).fetch()

#   action_list = Actions.find({ # First get all child actions
#             "action_type":"child",
#             "estate_id": id_param
#           }

#   # For each Building, create the Action List
#   return _.map(building_list, (item) ->
#             return {
#                   "name": item.building_name,
#                   "id": item._id,
#                   "children": getActionsForBuilding(item._id)
#                 }
#           )
