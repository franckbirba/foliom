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
                "fluid_consumption_meter" : []


              };

              var total_kWhef_Fluids = 0;
              var total_kWhef_Fluids_array = [];

              var fluid_consumption_meter_cellsNb = 6

              for (i = 0; i < fluid_consumption_meter_cellsNb; i++) {
                var fluid_id = 'fluid_consumption_meter.' + i + '.fluid_id';
                var yearly_subscription = 'fluid_consumption_meter.' + i + '.yearly_subscription';
                var first_year_value = 'fluid_consumption_meter.' + i + '.first_year_value';

                if (element[fluid_id] !== "") {
                  console.log(element[fluid_id]);

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
