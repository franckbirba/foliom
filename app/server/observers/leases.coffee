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
    triggerAlerts(id, fields)


# Leases.find().observe
  # added: (doc) ->
  #   # computeAverages(doc)
  #   console.log "in ADDED"
  #   console.log doc
  # changed: (newDocument, oldDocument) ->
  #   computeAverages(newDocument)


# Using Collection hooks instead of Observe, because of its erratic behaviour (ex: triggering multiple times for one update)
# BEWARE: hooks don't work when directly modifying MondoDB
Leases.after.insert (userId, doc) ->
  computeAverages(doc)

Leases.after.update ((userId, doc, fieldNames, modifier, options) ->
  computeAverages(doc)
), fetchPrevious: false

Leases.after.remove (userId, doc) ->
  computeAverages(doc)




triggerAlerts = (id, fields) ->
  # Only trigger alerts if both eligibility and diagnostic_alert are true
  alerts = _.where(fields.conformity_information, {eligibility: true, diagnostic_alert: true})

  if alerts.length > 0
    lease_name = Leases.findOne({_id:id}).lease_name
    building_name = buildingName_fromLeaseId(id)
    building_id = buildingId_fromLeaseId(id)
    today = Date.now()

    for key, value of fields.conformity_information
      if value.diagnostic_alert is true
        # Create the message
        # As the server does not have access to the session lang, use the preferred lang for the user
        msgTxt = TAPi18n.__("alert_message",
          { lease_name: lease_name, key: TAPi18n.__(key) },
          { lng: Meteor.user().profile.lang }
        )
        msgContent =
          name: 'EGIS-notifications'
          message: msgTxt
          time: today
          # link: entry.link
          # feed_id: id
          building_id: building_id

        Messages.upsert {time: today, message: msgTxt, building_id: building_id}, {$set: msgContent}

computeAverages = (document) ->
  doc_buiding_id = document.building_id
  allLeases = Leases.find({building_id:doc_buiding_id}).fetch()
  lease_dpe_ges_data = []
  comfort_qualitative_assessment_data = []

  # BUILDINGS - AGGLOMERATE

  # Averaged area (from all leases)
  areaArray = _.pluck allLeases, 'area_by_usage' # Result ex: [700, 290]
  areaSum = areaArray.reduce (prev, current) -> prev + current

  # ---------------------------- #
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
      grade: "dpe_#{parseDpeGesScale("dpe", leaseWithMaxArea.dpe_type, dpeEnergyConsuptionAverage)}"
      value: dpeEnergyConsuptionAverage
    dpe_co2_emission:
      grade: "dpe_#{parseDpeGesScale("ges", leaseWithMaxArea.dpe_type, dpeCo2EmissionAverage)}"
      value: dpeCo2EmissionAverage

  # ---------------------------- #
  # comfort_qualitative_assessment
  # Map Leases to get global_comfort_index * area_by_usage
  all_global_comfort_index = allLeases.map (item) ->
    item.comfort_qualitative_assessment.global_comfort_index * item.area_by_usage / areaSum
  global_comfort_index_reduced = _.reduce all_global_comfort_index, ((memo, data) ->
    data + memo), 0

  # ---------------------------- #
  # technical_compliance global_lifetime and global_conformity
  all_tc_global_lifetime = allLeases.map (item) ->
    item.technical_compliance.global_lifetime * item.area_by_usage / areaSum
  tc_global_lifetime = _.reduce all_tc_global_lifetime, ((memo, data) ->
    data + memo), 0

  all_tc_global_conformity = allLeases.map (item) ->
    item.technical_compliance.global_conformity * item.area_by_usage / areaSum
  tc_global_conformity = _.reduce all_tc_global_conformity, ((memo, data) ->
    data + memo), 0

  tc =
    global_lifetime: tc_global_lifetime
    global_conformity: tc_global_conformity



  Buildings.update { _id: doc_buiding_id },
    { $set: {
      'properties.leases_averages.merged_dpe_ges_data': merged_dpe_ges_data,
      'properties.leases_averages.global_comfort_index': global_comfort_index_reduced,
      'properties.leases_averages.technical_compliance': tc,
      'properties.leases_averages.area_sum': areaSum
    }}

