// On Template rendered: make sure we display the Portfolios
Template.observatory.rendered = function () {
    Session.set('portfolio_level', true);

};

// Get list of all Portfolios for current Estate, sorted by alpha (on name)
Template.observatory.helpers({
    getBuildingList: function(){
        if ( Session.get('current_portfolio_doc') !== undefined ) {
            return Buildings.find({portfolio_id: Session.get('current_portfolio_doc')._id },
                        {sort: {building_name:1}}
                        ).fetch();
        }
    },
    isBuilding: function(){
        if ( Session.get('current_portfolio_doc') !== undefined ) {
            return true ;
        }
    }
});


Template.observatory.events({
  'click .importPortfolio': function(){
    // Excel files need to be saved as .txt UTF16 (see http://stackoverflow.com/questions/4221176/excel-to-csv-with-utf8-encoding)
    $("#importPortfolio").parse({
        config: {
          complete: function(results, file) {
            console.log("results.data are");
            console.log(results.data);

            _.each(results.data, function(element, index, list){
              console.log("element is:");
              console.table(element);

              console.log("[%d] - Portfolio: %s - Building: %s", index, element[0], element[1]);
              getGeocoding({street: element[5], city: element[3], country: element[2]},function(geo){
                // var tmpBuilding = {
                //   "building_name": element[1],
                //   "address": {
                //     "street": element[5],
                //     "zip": element[4],
                //     "city": element[3],
                //     "area": element[6],
                //     "country": element[2],
                //     "gps_lat": geo.gps_lat,
                //     "gps_long": geo.gps_long
                //   },
                //   "building_info": {
                //     "construction_year": element[14],
                //     "building_control": "control_full",
                //     "building_user": "own_use",
                //     "area_total": element[7],
                //     "area_useful": element[8],
                //     "building_nb_floors": element[9],
                //     "carpark_spaces": element[10],
                //     "carpark_area": element[11]
                //   },
                //   "portfolio_id": Session.get('current_portfolio_doc')._id
                // };
                var tmpBuilding = {
                  "building_name": element[1],
                  "address": {
                    "street": element[5],
                    "zip": element[4],
                    "city": element[3],
                    "area": element[6],
                    "country": element[2],
                    "gps_lat": geo.gps_lat,
                    "gps_long": geo.gps_long
                  },
                  "building_info": {
                    "construction_year": element[14],
                    "building_control": "control_full",
                    "building_user": "own_use",
                    "area_total": element[7],
                    "area_useful": element[8],
                    "building_nb_floors": element[9],
                    "carpark_spaces": element[10],
                    "carpark_area": element[11]
                  },
                  "portfolio_id": Session.get('current_portfolio_doc')._id
                };
                 console.log("tmpBuilding is");
                 console.log(tmpBuilding);
              var newId = Buildings.insert(tmpBuilding);
              console.log('New building %s: %s created', tmpBuilding.building_name, newId);
              });

            });
          }
        },
        complete: function() {
          console.log("All files done!");
        }
    });
  },
  'click .select_portfolio': function() {
      Session.set('current_portfolio_doc', this); // "this" is passed by Meteor - it's the current item

      if ( Session.get('portfolio_level') ) {
          Session.set('portfolio_level', false);
          $( "#building_list" ).fadeIn();
      };

      // Meteor.subscribe('configurations', this._id);
      // console.log('INSERT - update_estate_var is now: ' +  Session.get('update_estate_var'));
  },
  'click .glyphicon-globe': function() {
      Session.set('current_portfolio_doc', undefined);

  },
  'click .select_building': function(e) {
      e.preventDefault();
      Session.set('current_building_doc', this); // "this" is passed by Meteor - it's the current item
      Router.go('building-detail', this);
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
          console.log(latlng);

          _geocoding.gps_lat = latlng.lat();
          _geocoding.gps_long = latlng.lng();

          callback(_geocoding);

        }
      }
    });

  });
}
