
Template.buildingDetail.helpers
  getLeases: ->
    result = Leases.find({ building_id: Session.get('current_building_doc')._id }, sort: lease_name: 1).fetch()
    result
  waterConsumption: (param, precision) ->
    if waterFluids? #wait until the waterFluids array has been generated

      if Session.get('current_lease_id')?
        # in waterFluids array, get the one corresponding to the Session var (set by selector)
        correctWaterFluid = _.where(waterFluids, lease_id: Session.get('current_lease_id'))[0]
        if param is 'yearly_cost'
          return correctWaterFluid.yearly_cost
        if param is 'm3'
          return correctWaterFluid.first_year_value
        if param is 'm3/m2'
          return (correctWaterFluid.first_year_value / correctWaterFluid.surface).toFixed(precision)
        if param is '€/m3'
          return (correctWaterFluid.yearly_cost / correctWaterFluid.first_year_value).toFixed(precision)

      else
        if param == 'yearly_cost'
          # return waterFluids.map(function(fluid){
          #     return { label: item.end_use_name, value: item.first_year_value }
          # });
          return 0
        if param == 'm3'
          # return correctWaterFluid.first_year_value;
          return 0
        if param == 'm3/m2'
          # return (correctWaterFluid.first_year_value / correctWaterFluid.surface).toFixed(precision);
          return 0
        if param == '€/m3'
          # return (correctWaterFluid.yearly_cost / correctWaterFluid.first_year_value).toFixed(precision);
          return 0
    return


Template.buildingDetail.events
  'change #leaseSelect': (event) ->
    if event.target.value is 'all_leases'
      Session.set 'current_lease_id', null
    else
      Session.set 'current_lease_id', event.target.value

  'click .update_lease': (e) ->
    e.preventDefault()
    Session.set 'leaseToEdit', this # "this" is passed by Meteor - it's the current item
    Router.go 'leaseForm'

