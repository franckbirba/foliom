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

var getPortfolioId = function(portfolioName, callback){
      var tmp = Portfolios.findOne({name:portfolioName});
      if(!tmp){
        tmp = {};
        tmp._id = Portfolios.insert({name: portfolioName});
      }
      return tmp._id;
    };
var wrappedGetPortfolioId = Meteor.wrapAsync(getPortfolioId);

Template.observatory.events({
    'click .importPortfolio': function(){
      $("#importPortfolio").parse({
          config: {
              complete: function(results, file) {
                  _.each(results.data, function(element, index, list){
                    console.log("%d Portfolio %s Building %s", index, element[1], element[0]);
                    getGeocoding({street: element[5], city: element[3], country: element[2]},function(geo){
                      var tmpBuilding = {
                        "building_name": element[0],
                        "address": {
                          "street": element[5],
                          "zip": element[4],
                          "city": element[3],
                          "area": "",
                          "country": element[2],
                          "gps_lat": geo.gps_lat,
                          "gps_long": geo.gps_long
                        },
                        "building_info": {
                          "construction_year": element[20],
                          "building_control": "control_full",
                          "building_user": "own_use",
                          "area_total": element[10],
                          "area_useful": 19,
                          "building_nb_floors": element[11],
                          "carpark_spaces": element[16],
                          "carpark_area": element[17]
                        },
                        "portfolio_id": Session.get('current_portfolio_doc')._id /*wrappedGetPortfolioId(element[1])*/
                      };
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

        // $( "#portfolio_list" ).fadeOut("fast", function() {
        //     Session.set('portfolio_level', false);
        //     $( "#building_list" ).fadeIn();
        // });

        if ( Session.get('portfolio_level') ) {
            Session.set('portfolio_level', false);
            $( "#building_list" ).fadeIn();
        };

        // Meteor.subscribe('configurations', this._id);
        // console.log('INSERT - update_estate_var is now: ' +  Session.get('update_estate_var'));
    },
    'click .back2portfolios': function() {
        Session.set('portfolio_level', true);

        $( "#building_list" ).fadeOut("fast", function() {
            Session.set('portfolio_level', true);
            $( "#portfolio_list" ).fadeIn();
        });
    },
    'click .glyphicon-globe': function() {
        Session.set('current_portfolio_doc', undefined);

    },
    'click .select_building': function(e) {
        e.preventDefault();
        Session.set('current_building_doc', this); // "this" is passed by Meteor - it's the current item

        console.log("current Building is: ");
        console.log(this);

        Router.go('buildingDetail', this);
    },

});

function getGeocoding(address, callback){
  var tmpl = this;
  VazcoMaps.init({}, function() {
      var _geocoding = {gps_lat:0,gps_long:0};
                    tmpl.mapEngine = VazcoMaps.gMaps();

                    var tmp_address = address.street + " " + address.city + " " + address.country;
    console.log(tmp_address);

                    tmpl.mapEngine.geocode({
                      address: tmp_address,
                      callback: function(results, status) {
                        if (status == 'OK') {
                          var latlng = results[0].geometry.location;
                          console.log(latlng);

                          _geocoding.gps_lat = latlng.lat();
                          // console.log("building_doc.address.gps_lat is: " + building_doc.address.gps_lat);
                          _geocoding.gps_long = latlng.lng();
                          // console.log("building_doc.address.gps_long is: " + building_doc.address.gps_long);



                            console.log("building_doc.address.gps_lat is: " + _geocoding.gps_lat);
                            console.log("building_doc.address.gps_long is: " + _geocoding.gps_long);
                            callback(_geocoding);

                        }
                      }
                    });
                });
}
