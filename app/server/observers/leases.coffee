
# Using Collection hooks instead of Observe, because of its erratic behaviour (ex: triggering multiple times for one update)
# BEWARE: hooks don't work when directly modifying MondoDB
Leases.after.insert (userId, doc) ->
  computeAverages(doc)
  triggerAlerts(this._id, doc)

Leases.after.update ((userId, doc, fieldNames, modifier, options) ->
  computeAverages(doc)
  triggerAlerts(doc._id, doc)
), fetchPrevious: false

Leases.after.remove (userId, doc) ->
  computeAverages(doc)




root = @
triggerAlerts = (id, doc) =>
  # Only trigger alerts if both eligibility and diagnostic_alert are true
  alerts = _.where(doc.conformity_information, {eligibility: true, diagnostic_alert: true})

  if alerts.length > 0
    lease_name = Leases.findOne({_id:id}).lease_name
    building_id = buildingId_fromLeaseId(id)
    building = Buildings.findOne {_id:building_id}
    building_name = building.building_name
    today = Date.now()

    estate_id = estateId_fromBuildingId(building_id)

    for key, value of doc.conformity_information
      if value.diagnostic_alert is true and value.eligibility is true
        # Create the message
        # As the server does not have access to the session lang, use the preferred lang for the user
        user_lang = root.current_user.profile.lang
        # Example: TAPi18n.__("tree_mode_select", { lng: "en" } )
        # NB: don't put lng as an object when passing parameters (TAPi18n is designed this way)
        msgTxt = TAPi18n.__("alert_message",
          { lease_name: lease_name, key: TAPi18n.__(key, { lng: user_lang }) },
          user_lang
        )
        msgContent =
          name: 'EGIS-notifications'
          message: msgTxt
          time: today
          building_id: building_id
          estate_id: estate_id

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

