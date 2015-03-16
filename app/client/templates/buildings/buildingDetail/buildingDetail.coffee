Template.buildingDetail.created = ->
  instance = this
  instance.waterFluids = new ReactiveVar([])
  instance.dpe_ges_data = new ReactiveVar([])

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
      waterFluids.push entry

  console.log "waterFluids"
  console.log waterFluids

  Template.instance().waterFluids.set(waterFluids)
  ### ------------ ###


  ### ------------------------------ ###
  #  Create data for the DPE barchart
  ### ------------------------------ ###
  dpe_ges_data = Template.instance().dpe_ges_data.get()

  for lease in @data.allLeases
    dpe_ges_data.push
      lease_name: lease.lease_name
      lease_id: lease._id
      surface: lease.area_by_usage
      dpe_type: lease.dpe_type
      dpe_energy_consuption: lease.dpe_energy_consuption
      dpe_co2_emission: lease.dpe_co2_emission

  console.log "dpe_ges_data is"
  console.log dpe_ges_data
  Template.instance().dpe_ges_data.set(dpe_ges_data)
  ### ------------ ###

  ### ------------------------------ ###
  #  Data for the averages
  ### ------------------------------ ###
  #Averaged area (from all leases)
  areaArray = _.pluck @data.allLeases, 'area_by_usage' #Result ex: [700, 290]
  @data.areaSum = areaArray.reduce (prev, current) -> prev + current

  @data.av_waterConsumption = {}
  #Averaged yearly_cost
  av_yearly_cost_array = _.map waterFluids, (fluid) ->
    fluid.yearly_cost * fluid.surface / Template.currentData().areaSum
  @data.av_waterConsumption.av_yearly_cost = av_yearly_cost_array.reduce (prev, current) -> prev + current

  console.log "@data is"
  console.log @data



Template.buildingDetail.helpers
  getLeases: ->
    result = Leases.find({ building_id: Session.get('current_building_doc')._id }, sort: lease_name: 1).fetch()
    result
  dpe_ges_dataH: ->
    dpe_ges_data = Template.instance().dpe_ges_data.get() #get all DPE_GES DATA
    if Session.get('current_lease_id')?
      correctData = _.where(dpe_ges_data, lease_id: Session.get('current_lease_id'))[0]
    else dpe_ges_data[0]
      #@BSE: TO DO ([0] for the moment)

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
          return 0
        if param is 'm3/m2'
          # return (correctWaterFluid.first_year_value / correctWaterFluid.surface).toFixed(precision);
          return 0
        if param is '€/m3'
          # return (correctWaterFluid.yearly_cost / correctWaterFluid.first_year_value).toFixed(precision);
          return 0
        if param is 'm3/pers'
          return 0
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

