#Each time a new lease is inserted, save the technical_compliance categories
Leases.find().observeChanges
  changed:(id, fields) ->

    # #Save all technical_compliance categories NAMES
    # curr_portfolio_id = Buildings.findOne(entry.building_id).portfolio_id
    # curr_estate = Estates.findOne({portfolio_collection: curr_portfolio_id })

    # all_categories = _.pluck entry.technical_compliance.categories, 'name' #get all catogorie names
    # unique_names = _.union curr_estate.estate_properties.technical_compliance_categoriesList, all_categories #remove all duplicates

    # Estates.update {_id: curr_estate._id}, {
    #   $set: {'estate_properties.technical_compliance_categoriesList': unique_names}
    # }


    # ALERTS
    alerts = _.where(fields.conformity_information, {diagnostic_alert: true})

    if alerts.length > 0
      lease_name = Leases.findOne({_id:id}).lease_name
      building_name = buildingName_fromLeaseId(id)
      building_id = buildingId_fromLeaseId(id)
      today = new Date

      for key, value of fields.conformity_information
        if value.diagnostic_alert is true
          msgTxt = "Alert - Lease #{lease_name}: last diagnostic for #{key} is obsolete"
          msgContent =
            name: 'EGIS-notifications'
            message: msgTxt
            time: today
            # link: entry.link
            # feed_id: id
            building_id: building_id

          Messages.upsert {time: today, message: msgTxt, building_id: building_id}, {$set: msgContent}


# Leases.find().observe
  # added: (doc) ->
  #   # computeAverages(doc)
  #   console.log "in ADDED"
  #   console.log doc
  # changed: (newDocument, oldDocument) ->
  #   computeAverages(newDocument)


# Using Collection hooks instead of Observe. BEWARE: hooks don't work when directly modifying MondoDB
Leases.after.insert (userId, doc) ->
  computeAverages(doc)

Leases.after.update ((userId, doc, fieldNames, modifier, options) ->
  computeAverages(doc)
), fetchPrevious: false

Leases.after.remove (userId, doc) ->
  computeAverages(doc)


computeAverages = (document) ->
  doc_buiding_id = document.building_id
  allLeases = Leases.find({building_id:doc_buiding_id}).fetch()
  lease_dpe_ges_data = []

  # BUILDINGS - AGGLOMERATE

  # Averaged area (from all leases)
  areaArray = _.pluck allLeases, 'area_by_usage' # Result ex: [700, 290]
  areaSum = areaArray.reduce (prev, current) -> prev + current

  # AvgDpeEnergy & AvgCo2Consumption
  for lease in allLeases
    lease_dpe_ges_data.push
      surface: lease.area_by_usage
      dpe_type: lease.dpe_type
      dpe_energy_consuption: lease.dpe_energy_consuption
      dpe_co2_emission: lease.dpe_co2_emission

  # get type from lease with max Area
  leaseWithMaxArea = _.max lease_dpe_ges_data, (lease) -> lease.surface
  # create averaged dpe value
  dpeEnergyConsuptionAverage = _.reduce lease_dpe_ges_data, ((memo, data) ->
    data.dpe_energy_consuption.value * data.surface + memo), 0
  dpeEnergyConsuptionAverage /= areaSum
  # create averaged ges value
  dpeCo2EmissionAverage = _.reduce lease_dpe_ges_data, ((memo, data) ->
    data.dpe_co2_emission.value * data.surface + memo), 0
  dpeCo2EmissionAverage /= areaSum

  merged_dpe_ges_data =
    dpe_type: leaseWithMaxArea.dpe_type
    dpe_energy_consuption:
      value: dpeEnergyConsuptionAverage
    dpe_co2_emission:
      value: dpeCo2EmissionAverage

  Buildings.update { _id: doc_buiding_id },
    { $set: {
      'properties.leases_averages.merged_dpe_ges_data': merged_dpe_ges_data,
      'properties.leases_averages.area_sum': areaSum
    }}

