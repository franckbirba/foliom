@calcBuildingData = () ->
  building_list = Buildings.find({portfolio_id: Session.get('current_portfolio_doc')._id },
                              {sort: {name:1}}
                              ).fetch()
  # For each Building, create the Action List
  return _.map(building_list, (item) ->
            return {
                  "name": item.building_name,
                  "id": item._id,
                  "children": getActionsForBuilding(item._id)
                }
          )

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
