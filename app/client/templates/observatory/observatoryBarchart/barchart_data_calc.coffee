@calc_observatoryBarchart_data = (buildings) ->
  ###
  To be displayed in the barchart, the Data has to be structured as follows:
  var data = [
    {letter: "A", frequency: .08167},
    {letter: "B", frequency: .04780},
  ];
  We will add a 2 additional parameters
  building_IDs: an array to store the corresponding building IDs, so that when the User clicks on a bar, we know the corresponding buildings
  tooltip: an array to store the data we want to display in the tooltip
  ###

  barchartData = {} # Object to store our data

  # If a Portfolio is selected, select relevant buildings
  if Session.get('current_portfolio_doc')?
    buildings = _.where buildings, {'portfolio_id': Session.get('current_portfolio_doc')._id}

  # SPECIAL CASE FOR BUILDINGS BEING CREATED:
  # As they don't have Leases yet, we exclude buildings who don't have the 'properties' field
  buildings = _.chain(buildings).map((building) ->
    if building.hasOwnProperty('properties')
      building
    else
      false
  ).compact().value()


  # construction_year_data
  barchartData.construction_year_data = buildings.map((x) ->
    {
      letter: x.building_name
      frequency: x.building_info.construction_year
      building_IDs: [x._id]
      tooltip: [ x.building_info.construction_year ]
    }
  )

  # ges Data (dpe_co2_emission)
  dpe_co2_emission_data = buildings.map((x) ->
    {
      letter: x.properties.leases_averages.merged_dpe_ges_data.dpe_co2_emission.grade
      frequency: x.building_name
      id: x._id
    }
  )
  dpe_co2_emission_data = _.groupBy(dpe_co2_emission_data, 'letter')
  barchartData.dpe_co2_emission_data = _.map(dpe_co2_emission_data, (value, key) ->
    {
      letter: transr(key)()
      frequency: value.length
      building_IDs: _.pluck(value, 'id')
      tooltip: _.pluck(value, 'frequency') # List of all building names, in an array
    }
  )

  # dpe_energy_consuption Data
  dpe_energy_consuption_data = buildings.map((x) ->
    {
      letter: x.properties.leases_averages.merged_dpe_ges_data.dpe_energy_consuption.grade
      frequency: x.building_name
      id: x._id
    }
  )
  dpe_energy_consuption_data = _.groupBy(dpe_energy_consuption_data, 'letter')
  barchartData.dpe_energy_consuption_data = _.map(dpe_energy_consuption_data, (value, key) ->
    {
      letter: transr(key)()
      frequency: value.length
      building_IDs: _.pluck(value, 'id')
      tooltip: _.pluck(value, 'frequency') # List of all building names, in an array
    }
  )

  # global_comfort_index Data
  global_comfort_index_data = buildings.map((x) ->
    {
      letter: x.properties.leases_averages.global_comfort_index.toFixed(1) * 1
      frequency: x.building_name
      id: x._id
    }
  )
  global_comfort_index_data = _.groupBy(global_comfort_index_data, 'letter')
  barchartData.global_comfort_index_data = _.map(global_comfort_index_data, (value, key) ->
    {
      letter: transr(key)()
      frequency: value.length
      building_IDs: _.pluck(value, 'id')
      tooltip: _.pluck(value, 'frequency') # List of all building names, in an array
    }
  )

  # technical_compliance global_lifetime
  global_tc_lifetime_data = buildings.map((x) ->
    {
      letter: x.properties.leases_averages.technical_compliance.global_lifetime.toFixed(1) * 1
      frequency: x.building_name
      id: x._id
    }
  )
  global_tc_lifetime_data = _.groupBy(global_tc_lifetime_data, 'letter')
  barchartData.global_tc_lifetime_data = _.map(global_tc_lifetime_data, (value, key) ->
    {
      letter: transr(key)()
      frequency: value.length
      building_IDs: _.pluck(value, 'id')
      tooltip: _.pluck(value, 'frequency') # List of all building names, in an array
    }
  )
  # technical_compliance global_conformity
  global_tc_conformity_data = buildings.map((x) ->
    {
      letter: x.properties.leases_averages.technical_compliance.global_conformity.toFixed(1) * 1
      frequency: x.building_name
      id: x._id
    }
  )
  global_tc_conformity_data = _.groupBy(global_tc_conformity_data, 'letter')
  barchartData.global_tc_conformity_data = _.map(global_tc_conformity_data, (value, key) ->
    {
      letter: transr(key)()
      frequency: value.length
      building_IDs: _.pluck(value, 'id')
      tooltip: _.pluck(value, 'frequency') # List of all building names, in an array
    }
  )

  # Return data
  return barchartData
