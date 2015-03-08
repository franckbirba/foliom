Template.buildingAndLeaseImport.events({
  'click .importPortfolio': function(){
    // Excel files need to be saved as Windows CSV
    $("#importPortfolio").parse({
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
