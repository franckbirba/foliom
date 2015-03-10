Template.buildingAndLeaseImport.helpers({
    getLeases: function(building_id_param){
        return Leases.find(
            { building_id: building_id_param },
            {sort: {lease_name: 1}},
            {fields: {'lease_name':1}}
          ).fetch();
    }
});

Template.buildingAndLeaseImport.events({
  'click .importBuildings': function(){
    // Excel files need to be saved as Windows CSV
    $("#importBuildings").parse({
        config: {
          delimiter: ";",
          dynamicTyping: true,
          header: true,
          skipEmptyLines: true,
          encoding: "iso-8859-1",
          // newline: "\r",
          complete: function(results, file) {
            console.log("results.data are");
            console.log(results.data);

            _.each(results.data, function(element, index, list){
              // console.log("[%d] - Portfolio: %s - Building: %s", index, element[0], element[1]);

              getGeocoding({street: element.address1, city: element.city, country: element.country},function(geo){
                var tmpBuilding = {
                  "building_name": element.building_name,
                  "address": {
                    "street": element.address1,
                    "zip": element.zip_code,
                    "city": element.city,
                    "area": element.area,
                    "country": element.country,
                    "gps_lat": geo.gps_lat,
                    "gps_long": geo.gps_long
                  },
                  "building_info": {
                    "construction_year": element.construction_year,
                    "building_control": element.building_control,
                    "building_user": element.building_user,
                    "area_total": element.area_total,
                    "area_useful": element.area_useful,
                    "building_nb_floors": element.building_nb_floors,
                    "carpark_spaces": element.carpark_spaces,
                    "carpark_area": element.carpark_area
                  },
                  "portfolio_id": Session.get('current_portfolio_doc')._id
                };
                 // console.log("tmpBuilding is");
                 // console.log(tmpBuilding);
              var newId = Buildings.insert(tmpBuilding);
              // console.log('New building %s: %s created', tmpBuilding.building_name, newId);
              });

            });

          }
        },
        complete: function() {
          // console.log("All files done!");
        }
    });
  },
  'click .importLeases': function(){
    // Excel files need to be saved as Windows CSV
    $("#importLeases").parse({
        config: {
          delimiter: ";",
          dynamicTyping: true,
          header: true,
          skipEmptyLines: true,
          encoding: "iso-8859-1",
          // newline: "\r",
          complete: function(results, file) {
            console.log("results.data are");
            console.log(results.data);

            _.each(results.data, function(element, index, list){

              var tmpLease = {
                "building_id": element.building_id,
                "lease_name" : element.lease_name,
                "rental_status" : element.rental_status,
                "rent" : element.rent,
                "last_significant_renovation" : element.last_significant_renovation,
                "lease_usage" : element.lease_usage,
                "area_by_usage" : element.area_by_usage,
                "lease_nb_floors" : element.lease_nb_floors,
                "igh" : element.igh,
                "erp_status" : element.erp_status,
                "erp_category" : element.erp_category,
                "headcount" : element.headcount,
                "dpe_type" : element.dpe_type,
                "dpe_energy_consuption" : {
                  "grade" : element['dpe_energy_consuption.grade'],
                  "value" : element['dpe_energy_consuption.value']
                },
                "dpe_co2_emission" : {
                  "grade" : element['dpe_co2_emission.grade'],
                  "value" : element['dpe_co2_emission.value']
                },
                "fluid_consumption_meter" : [],
                "consumption_by_end_use" : [],
                "certifications" : [],
                "comfort_qualitative_assessment" : {
                  "acoustic" : element["comfort_qualitative_assessment.acoustic"],
                  "visual" : element["comfort_qualitative_assessment.visual"],
                  "thermic" : element["comfort_qualitative_assessment.thermic"],
                  "global_comfort_index" : 0,
                  "comments": element["comfort_qualitative_assessment.comments"]
                },
                "technical_compliance" : {
                  "categories" : {},
                  "global_lifetime" : "",
                  "global_conformity" : "",
                }


              };

              var total_kWhef_Fluids = 0;
              var total_kWhef_Fluids_array = [];

              var fluid_consumption_meter_cellsNb = 6

              for (i = 0; i < fluid_consumption_meter_cellsNb; i++) {
                var fluid_id = 'fluid_consumption_meter.' + i + '.fluid_id';
                var yearly_subscription = 'fluid_consumption_meter.' + i + '.yearly_subscription';
                var first_year_value = 'fluid_consumption_meter.' + i + '.first_year_value';

                if (element[fluid_id] !== "") {
                  // console.log(element[fluid_id]);

                  // CALC YEARLY COST
                  matchingFluid = element[fluid_id];
                  matchingYearlySubscription = element[yearly_subscription];
                  matchingFirstYearValue = element[first_year_value];

                  var correctFluid = fluidToObject(matchingFluid); // gets the Fluid obj in the conf. from a txt like "EDF - fluid_heat"
                  var yearly_cost = matchingYearlySubscription + matchingFirstYearValue * correctFluid.yearly_values[0].cost ;

                  tmpLease.fluid_consumption_meter.push(
                    {
                      "fluid_id" : element[fluid_id],
                      "yearly_subscription" : element[yearly_subscription],
                      "first_year_value" : element[first_year_value],
                      "yearly_cost" : yearly_cost
                    }
                  );

                  /* ---------------------------------------------- */
                  /* END-USE FORMULAS: consumption_by_end_use_total */
                  /* ---------------------------------------------- */
                    // 1- Take advatage of this Loop to update total_kWhef_Fluids
                    if (correctFluid.fluid_unit == "u_euro_kwhEF") {
                        total_kWhef_Fluids_array[i] = matchingFirstYearValue ;
                    } else {
                        total_kWhef_Fluids_array[i] = 0;
                    }

                    // 2- reduce array and update the field
                    total_kWhef_Fluids = _.reduce(total_kWhef_Fluids_array, function(memo, num){ return memo + num; }, 0);
                }
              };

              tmpLease.consumption_by_end_use_total = total_kWhef_Fluids;


              // CONSUMPTION BY END USE
              var consumption_by_end_use_cellsNb = 9;

              for (i = 0; i < consumption_by_end_use_cellsNb; i++) {
                var end_use_name = 'consumption_by_end_use.' + i + '.end_use_name';
                var fluid_id = 'consumption_by_end_use.' + i + '.fluid_id';
                var first_year_value = 'consumption_by_end_use.' + i + '.first_year_value';

                if (element[fluid_id] !== "") {
                  tmpLease.consumption_by_end_use.push(
                    {
                      "end_use_name" : element[end_use_name],
                      "fluid_id" : element[fluid_id],
                      "first_year_value" : element[first_year_value]
                    }
                  );
                }

              }

              // CERTIFICATIONS
              var certifications_cellsNb = 3;

              for (i = 0; i < certifications_cellsNb; i++) {
                var cert_id = 'certifications.' + i + '.cert_id';
                var cert_comments = 'certifications.' + i + '.cert_comments';

                if (element[cert_id] !== "") {
                  tmpLease.certifications.push(
                    {
                      "cert_id" : element[cert_id],
                      "cert_comments" : element[cert_comments]
                    }
                  );
                }

              }

              // comfort_qualitative_assessment
              tmpLease.comfort_qualitative_assessment.global_comfort_index = calc_qualitative_assessment(element["comfort_qualitative_assessment.acoustic"], element["comfort_qualitative_assessment.visual"], element["comfort_qualitative_assessment.thermic"]);


              // technical_compliance_items
              for (i = 0; i < technical_compliance_items.length; i++) {
                var name = technical_compliance_items[i];

                var lifetime = 'technical_compliance.' + name + '.lifetime';
                var conformity = 'technical_compliance.' + name + '.conformity';
                var description = 'technical_compliance.' + name + '.description';

                tmpLease.technical_compliance.categories[name] = {
                  "lifetime" : element[lifetime],
                  "conformity" : element[lifetime],
                  "description" : element[description],
                }

              }

              // CALC "global_lifetime" & "global_conformity"
              var global_lifetime_array = _.pluck(tmpLease.technical_compliance.categories,'lifetime');

              tmpLease.technical_compliance.global_lifetime = calc_qualitative_assessment_array(global_lifetime_array);

              var global_conformity_array = _.pluck(tmpLease.technical_compliance.categories,'conformity');

              tmpLease.technical_compliance.global_conformity = calc_qualitative_assessment_array(global_conformity_array);

              tmpLease.technical_compliance.tc_comments = element["technical_compliance.tc_comments"];

              // technical_compliance_items = ['core_and_shell', 'facade', 'roof_terrasse', 'heat_production', 'chiller', 'power_supply', 'electrical_delivery', 'thermal_delivery', 'heating_terminal', 'chiller_terminal', 'lighting_terminal', 'GTC_GTB', 'air_system', 'ventilation_system', 'hot_water_production', 'hot_water_delivery', 'fire_security'];

              console.log("tmpLease is");
              console.log(tmpLease);

              // var newId = Leases.insert(tmpLease);



            });

          }
        },
        complete: function() {
          // console.log("All files done!");
        }
    });
  },

});

function getGeocoding(address, callback){
  var tmpl = this;
  VazcoMaps.init({}, function() {
    var _geocoding = {gps_lat:0,gps_long:0};
    tmpl.mapEngine = VazcoMaps.gMaps();
    var tmp_address = address.street + " " + address.city + " " + address.country;
    // console.log(tmp_address);

    tmpl.mapEngine.geocode({
      address: tmp_address,
      callback: function(results, status) {
        if (status == 'OK') {
          var latlng = results[0].geometry.location;
          // console.log(latlng);

          _geocoding.gps_lat = latlng.lat();
          _geocoding.gps_long = latlng.lng();

          callback(_geocoding);

        }
      }
    });

  });
}
