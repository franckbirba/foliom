Template.buildingDetail.created = ->
  instance = this
  instance.waterFluids = new ReactiveVar([])
  instance.lease_dpe_ges_data = new ReactiveVar([])
  instance.merged_dpe_ges_data = new ReactiveVar([]) #Result of all Leases DPE_GES Data

  Session.set("current_lease_id", null) #Reset the var session associated to the Selector

  current_building_doc_id = @data._id
  @data.allLeases = Leases.find(building_id: current_building_doc_id).fetch()

  ### ------------ ###
  # CALC WATER FLUIDS
  waterFluids = Template.instance().waterFluids.get()

  #get the Water fluids for each Lease
  _.each @data.allLeases, (lease, i) ->
    #For each lease, extract the fluid with the fluid_type to water
    for entry in lease.fluid_consumption_meter when entry.fluid_id.split(' - ')[1] is 'fluid_water'
      # surcharge: add the surface and id to make the average easier
      entry.surface = lease.area_by_usage
      entry.lease_id = lease._id
      entry.headcount = lease.headcount
      waterFluids.push entry

  console.log "waterFluids"
  console.log waterFluids

  Template.instance().waterFluids.set(waterFluids)
  ### ------------ ###


  ### ------------------------------ ###
  #  Data for the averages
  ### ------------------------------ ###
  #Averaged area (from all leases)
  areaArray = _.pluck @data.allLeases, 'area_by_usage' #Result ex: [700, 290]
  @data.areaSum = areaArray.reduce (prev, current) -> prev + current

  @data.av_waterConsumption = {}

  average_water_data = (waterFluids, areaSum, param) =>
    if param is 'yearly_cost'
      av_array = _.map waterFluids, (fluid) ->
        fluid.yearly_cost * fluid.surface / areaSum
    if param is 'm3'
      av_array = _.map waterFluids, (fluid) ->
        fluid.first_year_value * fluid.surface / areaSum
    if param is 'm3/m2'
      av_array = _.map waterFluids, (fluid) ->
        #(correctWaterFluid.first_year_value / correctWaterFluid.surface).toFixed(precision)
        fluid.first_year_value / areaSum # Multiplying and dividing by surface > simplification
    if param is '€/m3'
      # correctWaterFluid.yearly_cost / correctWaterFluid.first_year_value
      av_array = _.map waterFluids, (fluid) ->
        fluid.yearly_cost * fluid.surface / (areaSum * fluid.first_year_value)
    if param is 'm3/pers'
      # correctWaterFluid.first_year_value / curr_lease.headcount
      av_array = _.map waterFluids, (fluid, index) ->
        fluid.first_year_value * fluid.surface / (areaSum * fluid.headcount)

    av_array.reduce (prev, current) -> prev + current #one-liner to reduce the array


  @data.av_waterConsumption.av_yearly_cost = average_water_data(waterFluids, @data.areaSum, 'yearly_cost')
  @data.av_waterConsumption.av_m3 = average_water_data(waterFluids, @data.areaSum, 'm3')
  @data.av_waterConsumption.av_m3_by_m2 = average_water_data(waterFluids, @data.areaSum, 'm3/m2')
  @data.av_waterConsumption.av_euro_by_m3 = average_water_data(waterFluids, @data.areaSum, '€/m3')
  @data.av_waterConsumption.av_m3_by_pers = average_water_data(waterFluids, @data.areaSum, 'm3/pers')


  ### ------------------------------ ###
  #  Create data for the DPE barchart
  ### ------------------------------ ###
  lease_dpe_ges_data = instance.lease_dpe_ges_data.get()

  for lease in @data.allLeases
    lease_dpe_ges_data.push
      lease_name: lease.lease_name
      lease_id: lease._id
      surface: lease.area_by_usage
      dpe_type: lease.dpe_type
      dpe_energy_consuption: lease.dpe_energy_consuption
      dpe_co2_emission: lease.dpe_co2_emission

  console.log "lease_dpe_ges_data is", lease_dpe_ges_data
  #console.log "merged_dpe_ges_data is", merged_dpe_ges_data

  instance.lease_dpe_ges_data.set(lease_dpe_ges_data)
  #instance.merged_dpe_ges_data.set(merged_dpe_ges_data)
  ### ------------ ###


  console.log "@data is"
  console.log @data



Template.buildingDetail.helpers
  getLeases: ->
    result = Leases.find({ building_id: Session.get('current_building_doc')._id }, sort: lease_name: 1).fetch()
    result
  dpe_ges_dataH: ->
    lease_dpe_ges_data = Template.instance().lease_dpe_ges_data.get() #get all lease DPE_GES DATA
    merged_dpe_ges_data = Template.instance().merged_dpe_ges_data.get() #get merged DPE_GES DATA
    if Session.get('current_lease_id')?
      correctData = _.where(lease_dpe_ges_data, lease_id: Session.get('current_lease_id'))[0]
    else merged_dpe_ges_data


  getCertificates: ->
    if Session.get('current_lease_id')?
      result = Leases.find({ _id: Session.get('current_lease_id') }, {fields: {certifications: 1}}).fetch()[0]
    else
      result = Leases.find({ building_id: Session.get('current_building_doc')._id }, {fields: {certifications: 1}}).fetch()

      allCerts = _.flatten _.map result, (lease) ->
        return lease.certifications #Each lease.certifications is an array, hence the _.flatten
      result.certifications = _.uniq allCerts


    if result.certifications
      for cert in result.certifications
        cert.cert_url = "/icon/certificates/#{cert.cert_id}.png" #Construct the URL
      result.certifications #return array

  waterConsumption: (param, precision) ->
    waterFluids = Template.instance().waterFluids.get()

    if waterFluids? #wait until the waterFluids array has been generated

      if Session.get('current_lease_id')?
        curr_lease = Leases.findOne({ _id: Session.get('current_lease_id') })

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
        if param is 'm3/pers'
          return (correctWaterFluid.first_year_value / curr_lease.headcount).toFixed(precision)

      else
        if param is 'yearly_cost'
          return Template.currentData().av_waterConsumption.av_yearly_cost.toFixed(precision)
        if param is 'm3'
          # return correctWaterFluid.first_year_value;
          return Template.currentData().av_waterConsumption.av_m3.toFixed(precision)
        if param is 'm3/m2'
          # return (correctWaterFluid.first_year_value / correctWaterFluid.surface).toFixed(precision);
          return Template.currentData().av_waterConsumption.av_m3_by_m2.toFixed(precision)
        if param is '€/m3'
          # return (correctWaterFluid.yearly_cost / correctWaterFluid.first_year_value).toFixed(precision);
          return Template.currentData().av_waterConsumption.av_euro_by_m3.toFixed(precision)
        if param is 'm3/pers'
          return Template.currentData().av_waterConsumption.av_m3_by_pers.toFixed(precision)
    return


Template.buildingDetail.rendered = ->
  current_building_doc_id = Session.get('current_building_doc')._id
  allLeases = Leases.find(building_id: current_building_doc_id).fetch()


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

