Template.buildingDetail.created = ->
  instance = this
  instance.waterFluids = new ReactiveVar([])

  Session.set("current_lease_id", null) #Reset the var session associated to the Selector



Template.buildingDetail.helpers
  getLeases: ->
    result = Leases.find({ building_id: Session.get('current_building_doc')._id }, sort: lease_name: 1).fetch()
    result
  waterConsumption: (param, precision) ->
    waterFluids = Template.instance().waterFluids.get()
    console.log waterFluids

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


Template.buildingDetail.rendered = ->
  current_building_doc_id = Session.get('current_building_doc')._id
  allLeases = Leases.find(building_id: current_building_doc_id).fetch()

  waterFluids = Template.instance().waterFluids.get()

  #get the Water fluids for each Lease
  _.each allLeases, (lease, i) ->
    #For each lease, extract the fluid with the fluid_type to water
    _.each lease.fluid_consumption_meter, (entry, i) ->
      if entry.fluid_id.split(' - ')[1] is 'fluid_water'
        # surcharge: add the surface and id to make the average easier
        entry.surface = lease.area_by_usage
        entry.lease_id = lease._id
        waterFluids.push entry

  # debugger

  console.log waterFluids
  Template.instance().waterFluids.set(waterFluids)


  ### ---------------------###
  #  Create data for the Pie
  ### ---------------------###

  dataHolder = []
  averagedData =
    'text_domain': []
    'data': []
  totalSurface = 0
  # Build the text domain and the Data
  _.each allLeases, (entry, i) ->
    dataHolder[i] = _id: entry._id
    dataHolder[i].text_domain = entry.consumption_by_end_use.map((item) ->
      item.end_use_name
      # returns an array of the EndUse names
    )
    dataHolder[i].data = entry.consumption_by_end_use.map((item) ->
      {
        label: item.end_use_name
        value: item.first_year_value
      }
    )
    _.each dataHolder[i].data, (entry2, i) ->
      # console.log("current entry is: ");
      # console.log(entry2);
      if _.where(averagedData.data, label: entry2.label).length == 0
        # in this case the label does not exist
        averagedData.text_domain.push entry2.label
        averagedData.data.push
          label: entry2.label
          value: entry2.value * entry.area_by_usage
      else
        _.each averagedData.data, (entry3, i) ->
          if entry3.label == entry2.label
            # console.log("was heeere - label is: "+ entry2.label);
            # console.log("entry3.value is: " + entry3.value);
            # console.log("entry2.value (dataHolder value) is: " + entry2.value);
            # console.log("area of useage is: " + entry.area_by_usage);
            entry3.value += entry2.value * entry.area_by_usage
          return
      return
    totalSurface += entry.area_by_usage
    # console.log("dataHolder: "+i);
    # console.log(JSON.stringify(dataHolder[i]) );
    # console.log("averagedData: ");
    # console.log(JSON.stringify(averagedData));
    return
  #And to finish: divide all data values by the Total surface
  _.each averagedData.data, (dataItem, i) ->
    dataItem.value = (dataItem.value / totalSurface).toFixed(2)
    return
  Session.set 'pieData', dataHolder
  Session.set 'averagedPieData', averagedData

  ### ------------------------------ ###

  #Create data for the DPE barchart

  ### ------------------------------ ###

  #TODO
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

