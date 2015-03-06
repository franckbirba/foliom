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
          delimiter: ";",
          dynamicTyping: true,
          header: true,
          skipEmptyLines: true,
          encoding: "iso-8859-1",
          // newline: "\r",
          complete: function(results, file) {
            console.log("results.data are");
            console.log(results.data);

            // _.each(results.data, function(element, index, list){
            //   // console.log("[%d] - Portfolio: %s - Building: %s", index, element[0], element[1]);

            //   getGeocoding({street: element.address1, city: element.city, country: element.country},function(geo){
            //     var tmpBuilding = {
            //       "building_name": element.building_name,
            //       "address": {
            //         "street": element.address1,
            //         "zip": element.zip_code,
            //         "city": element.city,
            //         "area": element.area,
            //         "country": element.country,
            //         "gps_lat": geo.gps_lat,
            //         "gps_long": geo.gps_long
            //       },
            //       "building_info": {
            //         "construction_year": element.construction_year,
            //         "building_control": element.building_control,
            //         "building_user": element.building_user,
            //         "area_total": element.area_total,
            //         "area_useful": element.area_useful,
            //         "building_nb_floors": element.building_nb_floors,
            //         "carpark_spaces": element.carpark_spaces,
            //         "carpark_area": element.carpark_area
            //       },
            //       "portfolio_id": Session.get('current_portfolio_doc')._id
            //     };
            //      // console.log("tmpBuilding is");
            //      // console.log(tmpBuilding);
            //   var newId = Buildings.insert(tmpBuilding);
            //   // console.log('New building %s: %s created', tmpBuilding.building_name, newId);
            //   });

            // });

          }
        },
        complete: function() {
          // console.log("All files done!");
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
          // console.log(latlng);

          _geocoding.gps_lat = latlng.lat();
          _geocoding.gps_long = latlng.lng();

          callback(_geocoding);

        }
      }
    });

  });
}
