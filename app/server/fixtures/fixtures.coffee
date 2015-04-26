exports = this

exports.createBuildings = (nb_buildings) ->
  building_1 =
    "_id": "25bQcnwe2RZHdjsu5"
    "building_name": "Bâtiment Test"
    "address":
      "street": "1 rue des Prairies"
      "zip": 75020
      "city": "Paris"
      "country": "France"
      "gps_lat": "48.8610739"
      "gps_long": "2.4048792999999478"
    "building_info":
      "construction_year": 1990
      "building_control": "control_shared"
      "building_user": "own_use"
      "area_total": 1000
      "area_useful": 990
      "building_nb_floors": 1
      "carpark_spaces": 0
      "carpark_area": 0
    "portfolio_id": "3tdkJMaCWcuHLotJw"
  building_data = [building_1]

  lease_data_1 = [
    {
      '_id': 'xPxb47pbPSZm2trcE'
      'lease_name': 'Lease1Test'
      'rental_status': 'rented'
      'rent': 67
      'last_significant_renovation': 1999
      'lease_usage': 'office'
      'area_by_usage': 700
      'lease_nb_floors': 1
      'igh': 'no'
      'erp_status': 'erp_L'
      'erp_category': 'erp_1'
      'headcount': 1600
      'dpe_type': 'tertiary_building_private'
      'dpe_energy_consuption':
        'grade': 'dpe_A'
        'value': 42
      'dpe_co2_emission':
        'grade': 'dpe_A'
        'value': 5
      'fluid_consumption_meter': [
        {
          'fluid_id': 'EDF - fluid_heat'
          'yearly_subscription': 11
          'first_year_value': 43
          'yearly_cost': 441
        }
        {
          'fluid_id': 'Lyonnaise des Eaux - fluid_water'
          'yearly_subscription': 43
          'first_year_value': 17
          'yearly_cost': 383
        }
        {
          'fluid_id': 'EDF - fluid_electricity'
          'yearly_subscription': 17
          'first_year_value': 24
          'yearly_cost': 737
        }
        {
          'fluid_id': 'Poweo - fluid_heat'
          'yearly_subscription': 14
          'first_year_value': 31
          'yearly_cost': 386
        }
      ]
      'consumption_by_end_use': [
        {
          'end_use_name': 'end_use_heating'
          'fluid_id': 'EDF - fluid_heat'
          'first_year_value': 12
        }
        {
          'end_use_name': 'end_use_AC'
          'fluid_id': 'EDF - fluid_electricity'
          'first_year_value': 7
        }
        {
          'end_use_name': 'end_use_ventilation'
          'fluid_id': 'EDF - fluid_electricity'
          'first_year_value': 4
        }
        {
          'end_use_name': 'end_use_lighting'
          'fluid_id': 'EDF - fluid_electricity'
          'first_year_value': 18
        }
        {
          'end_use_name': 'end_use_aux'
          'fluid_id': 'EDF - fluid_electricity'
          'first_year_value': 9
        }
        {
          'end_use_name': 'end_use_ecs'
          'fluid_id': 'Poweo - fluid_heat'
          'first_year_value': 14
        }
        {
          'end_use_name': 'end_use_specific'
          'fluid_id': 'EDF - fluid_electricity'
          'first_year_value': 34
        }
      ]
      'consumption_by_end_use_total': 98
      'certifications': [
        {
          "cert_id" : "nf_hqe"
          "cert_comments" : "ceci est un commentaire"
        }
        {
          "cert_id" : "breeam"
        }
      ]
      'comfort_qualitative_assessment':
        'acoustic': 'good'
        'visual': 'average'
        'thermic': 'bad'
        'global_comfort_index': 0.22
      'technical_compliance':
        'categories':
          'core_and_shell':
            'lifetime': 'good_dvr'
            'conformity': 'compliant'
          'facade':
            'lifetime': 'average_dvr'
            'conformity': 'compliant'
          'roof_terrasse':
            'lifetime': 'average_dvr'
            'conformity': 'compliant'
          'heat_production':
            'lifetime': 'new_dvr'
            'conformity': 'not_compliant_minor'
          'chiller':
            'lifetime': 'average_dvr'
            'conformity': 'compliant'
          'power_supply':
            'lifetime': 'bad_dvr'
            'conformity': 'compliant'
          'electrical_delivery':
            'lifetime': 'bad_dvr'
            'conformity': 'compliant'
          'thermal_delivery':
            'lifetime': 'new_dvr'
            'conformity': 'not_compliant_minor'
          'heating_terminal':
            'lifetime': 'new_dvr'
            'conformity': 'not_compliant_minor'
          'chiller_terminal':
            'lifetime': 'bad_dvr'
            'conformity': 'not_compliant_major'
          'lighting_terminal':
            'lifetime': 'new_dvr'
            'conformity': 'not_compliant_major'
          'GTC_GTB':
            'lifetime': 'average_dvr'
            'conformity': 'not_compliant_minor'
          'air_system':
            'lifetime': 'good_dvr'
            'conformity': 'not_compliant_major'
          'ventilation_system':
            'lifetime': 'bad_dvr'
            'conformity': 'not_compliant_major'
          'hot_water_production':
            'lifetime': 'bad_dvr'
            'conformity': 'not_compliant_major'
          'hot_water_delivery':
            'lifetime': 'good_dvr'
            'conformity': 'not_compliant_major'
          'fire_security':
            'lifetime': 'bad_dvr'
            'conformity': 'not_compliant_major'
        'global_lifetime': 0
        'global_conformity': 0
      'conformity_information':
        'accessibility':
          'eligibility': true
          'periodicity': 'monthly'
          'conformity': 'compliant'
        'elevators':
          'eligibility': true
          'periodicity': "monthly"
          'conformity': 'compliant'
        'ssi':
          'eligibility': true
          'periodicity': "monthly"
          'conformity': 'compliant'
        'asbestos':
          'eligibility': true
          'periodicity': "monthly"
          'conformity': 'compliant'
        'lead':
          'eligibility': true
          'periodicity': "monthly"
          'conformity': 'compliant'
        'legionella':
          'eligibility': true
          'periodicity': "monthly"
          'conformity': 'compliant'
        'electrical_installation':
          'eligibility': true
          'periodicity': "monthly"
          'conformity': 'compliant'
        'dpe':
          'eligibility': true
          'periodicity': "monthly"
          'conformity': 'compliant'
        'indoor_air_quality':
          'eligibility': true
          'periodicity': "monthly"
          'conformity': 'compliant'
        'radon':
          'eligibility': true
          'periodicity': "monthly"
          'conformity': 'compliant'
        'chiller_terminal':
          'eligibility': true
          'periodicity': "monthly"
          'conformity': 'compliant'
        'lead_disconnector':
          'eligibility': true
          'periodicity': "monthly"
          'conformity': 'compliant'
        'automatic_doors':
          'eligibility': true
          'periodicity': "monthly"
          'conformity': 'compliant'
        'chiller_system':
          'eligibility': true
          'periodicity': "monthly"
          'conformity': 'compliant'
      'building_id': '25bQcnwe2RZHdjsu5'
    }
    {
      '_id': 't9myg9avS3Ny3k3st'
      'lease_name': 'Lease2Test'
      'rental_status': 'rented'
      'rent': 67
      'last_significant_renovation': 1999
      'lease_usage': 'office'
      'area_by_usage': 290
      'lease_nb_floors': 1
      'igh': 'no'
      'erp_status': 'erp_L'
      'erp_category': 'erp_1'
      'headcount': 2600
      'dpe_type': 'housing'
      'dpe_energy_consuption':
        'grade': 'dpe_B'
        'value': 70
      'dpe_co2_emission':
        'grade': 'dpe_B'
        'value': 8
      'fluid_consumption_meter': [
        {
          'fluid_id': 'EDF - fluid_heat'
          'yearly_subscription': 50
          'first_year_value': 60
          'yearly_cost': 650
        }
        {
          'fluid_id': 'Lyonnaise des Eaux - fluid_water'
          'yearly_subscription': 31
          'first_year_value': 74
          'yearly_cost': 1151
        }
        {
          'fluid_id': 'EDF - fluid_electricity'
          'yearly_subscription': 50
          'first_year_value': 61
          'yearly_cost': 1180
        }
        {
          'fluid_id': 'Poweo - fluid_heat'
          'yearly_subscription': 57
          'first_year_value': 49
          'yearly_cost': 645
        }
      ]
      'consumption_by_end_use': [
        {
          'end_use_name': 'end_use_heating'
          'fluid_id': 'EDF - fluid_electricity'
          'first_year_value': 30
        }
        {
          'end_use_name': 'end_use_AC'
          'fluid_id': 'EDF - fluid_electricity'
          'first_year_value': 14
        }
        {
          'end_use_name': 'end_use_ventilation'
          'fluid_id': 'EDF - fluid_electricity'
          'first_year_value': 14
        }
        {
          'end_use_name': 'end_use_lighting'
          'fluid_id': 'EDF - fluid_electricity'
          'first_year_value': 22
        }
        {
          'end_use_name': 'end_use_aux'
          'fluid_id': 'EDF - fluid_electricity'
          'first_year_value': 5
        }
        {
          'end_use_name': 'end_use_ecs'
          'fluid_id': 'Poweo - fluid_heat'
          'first_year_value': 24
        }
        {
          'end_use_name': 'end_use_specific'
          'fluid_id': 'EDF - fluid_electricity'
          'first_year_value': 61
        }
      ]
      'consumption_by_end_use_total': 170
      'certifications': [
        {
          "cert_id" : "us_leed"
        }
        {
          "cert_id" : "effinergie"
        }
        {
          "cert_id" : "bepos2013"
        }
      ]
      'comfort_qualitative_assessment':
        'acoustic': 'good'
        'visual': 'average'
        'thermic': 'bad'
        'global_comfort_index': 0.22
      'technical_compliance':
        'categories':
          'core_and_shell':
            'lifetime': 'good_dvr'
            'conformity': 'compliant'
          'facade':
            'lifetime': 'average_dvr'
            'conformity': 'compliant'
          'roof_terrasse':
            'lifetime': 'average_dvr'
            'conformity': 'compliant'
          'heat_production':
            'lifetime': 'new_dvr'
            'conformity': 'not_compliant_minor'
          'chiller':
            'lifetime': 'average_dvr'
            'conformity': 'compliant'
          'power_supply':
            'lifetime': 'bad_dvr'
            'conformity': 'compliant'
          'electrical_delivery':
            'lifetime': 'bad_dvr'
            'conformity': 'compliant'
          'thermal_delivery':
            'lifetime': 'new_dvr'
            'conformity': 'not_compliant_minor'
          'heating_terminal':
            'lifetime': 'new_dvr'
            'conformity': 'not_compliant_minor'
          'chiller_terminal':
            'lifetime': 'bad_dvr'
            'conformity': 'not_compliant_major'
          'lighting_terminal':
            'lifetime': 'new_dvr'
            'conformity': 'not_compliant_major'
          'GTC_GTB':
            'lifetime': 'average_dvr'
            'conformity': 'not_compliant_minor'
          'air_system':
            'lifetime': 'good_dvr'
            'conformity': 'not_compliant_major'
          'ventilation_system':
            'lifetime': 'bad_dvr'
            'conformity': 'not_compliant_major'
          'hot_water_production':
            'lifetime': 'bad_dvr'
            'conformity': 'not_compliant_major'
          'hot_water_delivery':
            'lifetime': 'good_dvr'
            'conformity': 'not_compliant_major'
          'fire_security':
            'lifetime': 'bad_dvr'
            'conformity': 'not_compliant_major'
        'global_lifetime': 0
        'global_conformity': 0
      'conformity_information':
        'accessibility':
          'eligibility': true
          'periodicity': "monthly"
          'conformity': 'compliant'
        'elevators':
          'eligibility': true
          'periodicity': "monthly"
          'conformity': 'compliant'
        'ssi':
          'eligibility': true
          'periodicity': "monthly"
          'conformity': 'compliant'
        'asbestos':
          'eligibility': true
          'periodicity': "monthly"
          'conformity': 'compliant'
        'lead':
          'eligibility': true
          'periodicity': "monthly"
          'conformity': 'compliant'
        'legionella':
          'eligibility': true
          'periodicity': "monthly"
          'conformity': 'compliant'
        'electrical_installation':
          'eligibility': true
          'periodicity': "monthly"
          'conformity': 'compliant'
        'dpe':
          'eligibility': true
          'periodicity': "monthly"
          'conformity': 'compliant'
        'indoor_air_quality':
          'eligibility': true
          'periodicity': "monthly"
          'conformity': 'compliant'
        'radon':
          'eligibility': true
          'periodicity': "monthly"
          'conformity': 'compliant'
        'chiller_terminal':
          'eligibility': true
          'periodicity': "monthly"
          'conformity': 'compliant'
        'lead_disconnector':
          'eligibility': true
          'periodicity': "monthly"
          'conformity': 'compliant'
        'automatic_doors':
          'eligibility': true
          'periodicity': "monthly"
          'conformity': 'compliant'
        'chiller_system':
          'eligibility': true
          'periodicity': "monthly"
          'conformity': 'compliant'
      'building_id': '25bQcnwe2RZHdjsu5'
    }
  ]

  for i in [1..nb_buildings]
    buildingToCreate = clone building_1
    delete buildingToCreate._id
    buildingToCreate.building_name = "#{building_1.building_name}-#{i}"
    buildingToCreate.building_info.construction_year = randomIntFromInterval(1900, 2012)
    buildingToCreate.building_info.area_total = randomIntFromInterval(100, 3000)

    newBuilding_id = Buildings.insert buildingToCreate

    for lease in lease_data_1
      leaseToCreate = clone lease
      delete leaseToCreate._id
      delete leaseToCreate.building_id
      leaseToCreate.building_id = newBuilding_id

      leaseToCreate.dpe_energy_consuption.value = randomIntFromInterval(0, 800)
      leaseToCreate.dpe_energy_consuption.grade = "dpe_#{parseDpeGesScale("dpe", leaseToCreate.dpe_type, leaseToCreate.dpe_energy_consuption.value)}"
      leaseToCreate.dpe_co2_emission.value = randomIntFromInterval(0, 250)
      leaseToCreate.dpe_co2_emission.grade = "dpe_#{parseDpeGesScale("dpe", leaseToCreate.dpe_type, leaseToCreate.dpe_co2_emission.value)}"

      leaseToCreate.comfort_qualitative_assessment.acoustic = randomQualitativeValue('comfort_qualitative_assessment')
      leaseToCreate.comfort_qualitative_assessment.visual = randomQualitativeValue('comfort_qualitative_assessment')
      leaseToCreate.comfort_qualitative_assessment.thermic = randomQualitativeValue('comfort_qualitative_assessment')
      leaseToCreate.comfort_qualitative_assessment['global_comfort_index'] = calc_qualitative_assessment(leaseToCreate.comfort_qualitative_assessment.acoustic, leaseToCreate.comfort_qualitative_assessment.visual, leaseToCreate.comfort_qualitative_assessment.thermic)

      for item of leaseToCreate.technical_compliance.categories
        leaseToCreate.technical_compliance.categories[item].lifetime = randomQualitativeValue('technical_compliance_lifetime')
        leaseToCreate.technical_compliance.categories[item].conformity = randomQualitativeValue('technical_compliance_conformity')

      leaseToCreate.technical_compliance.global_lifetime = calc_qualitative_assessment_array( _.pluck(leaseToCreate.technical_compliance.categories, 'lifetime') )
      leaseToCreate.technical_compliance.global_conformity = calc_qualitative_assessment_array( _.pluck(leaseToCreate.technical_compliance.categories, 'conformity') )

      console.log leaseToCreate.technical_compliance


      Leases.insert leaseToCreate


exports.createActions = (nb_actions) ->
  action_1 =
    "name": "Robinet thermostatique"
    "logo": "&#58972;"
    "gain_fluids_kwhef": [
      {
        "opportunity": "end_use_heating",
        "per_cent": 5
      }
    ]
    "gain_fluids_water" : [
      {
        "opportunity" : "fluid_water"
        "per_cent" : 0
      }
    ]
    "project_type": "NA"
    "technical_field": "heat_production"
    "feasable_while_occupied": "no"
    "priority": "high"
    "other_gains":
        "technical_compliance_a": "NA"
        "regulatory_compliance": "no"
        "residual_lifetime": "no"
    "design_duration": 3
    "works_duration": 2
    "action_lifetime": 15
    "investment":
        "ratio": 5
    "gain_operating":
        "ratio": 0.5
    "raw_roi": 0
    "actualised_roi": 0
    "value_analysis": 0
    "lec": 0
    "internal_return": 0
    "action_type": "generic"

  actionNames = [
    "Isolation de la toiture"
    "Eclairage LED"
    "Détection de présence sur l'éclairage"
    "Bruleur modulant"
    "Mise en place de double vitrage"
    "Triple vitrage"
    "Survitrage"
    "Mise en place d'une mission d'Energy management"
    "Mise en place d'une GTB"
    "Mise à niveau d'une GTB existante"
    "Remplacement du fluide frigorigène"
    "Ventilation à débit variable"
    "Ventilation double flux avec récupération"
    "Isolation par l'intérieur"
    "Isolation par l'extérieur + enduit"
    "Reprise de l'étanchéité des chassis"
    "Isolation toiture terrasse"
    "Isolation vide sanitaire"
    "Sensibilisation des usagers"
    "Calorifuge des réseaux thermiques"
  ]

  for i in [1..nb_actions]
    actionToCreate = clone action_1
    delete actionToCreate._id
    actionToCreate.name = actionNames[i]
    randomLogo = 58880 + 99*Math.random()|0
    actionToCreate.logo = "&##{randomLogo};"

    Actions.insert actionToCreate



