@buildingId_fromLeaseId = (id) ->
  building_id = Leases.findOne({_id:id}, {fields: {building_id: 1}}).building_id

@buildingName_fromLeaseId = (id) ->
  building_id = buildingId_fromLeaseId(id)
  building_name = Buildings.findOne({_id:building_id}, {fields: {building_name: 1}}).building_name

# UTILITIES

# Check if var is an array or not
@typeIsArray = ( value ) ->
  value and
    typeof value is 'object' and
    value instanceof Array and
    typeof value.length is 'number' and
    typeof value.splice is 'function' and
    not ( value.propertyIsEnumerable 'length' )


# Clone object
@clone = (obj) ->
  return obj  if obj is null or typeof (obj) isnt "object"
  temp = new obj.constructor()
  for key of obj
    temp[key] = clone(obj[key])
  temp

# Generate an ID client-side. Risks of overlay are extremely low
@giveMeAnId = () ->
  return "#{new Date().getTime()}-#{Meteor.user().profile.lastName}"

# Compare a DVR (Lifetime) string value to a limit
@isLifetimeGreaterOrEqual = (lifetime, limit) ->
  # If calc_qualitative_value(lifetime) is equal or greater than the limit: return true
  if calc_qualitative_value(lifetime) <= calc_qualitative_value(limit)
    # Special case for the "new_dvr" limit
    if lifetime is "good_dvr" and limit is "new_dvr" then return false
    else return true
  else return false
