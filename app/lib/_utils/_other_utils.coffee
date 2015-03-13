@buildingId_fromLeaseId = (id) ->
  building_id = Leases.findOne({_id:id}, {fields: {building_id: 1}}).building_id

@buildingName_fromLeaseId = (id) ->
  building_id = buildingId_fromLeaseId(id)
  building_name = Buildings.findOne({_id:building_id}, {fields: {building_name: 1}}).building_name
