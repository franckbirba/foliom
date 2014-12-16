/* References
- https://atmospherejs.com/vazco/maps
- http://hpneo.github.io/gmaps/documentation.html
- http://hpneo.github.io/gmaps/
- https://github.com/hpneo/gmaps

*/

Template.mapCanvas2.rendered = function () {
    var tmpl = this;

    VazcoMaps.init({}, function() {

        tmpl.mapEngine = VazcoMaps.gMaps();

        tmpl.newMap2 = new tmpl.mapEngine({
            div: '#map-canvas2',
            lat: 51.10789,
            lng: 17.03854,
            zoom: 6
        });

        // var markerBounds = new google.maps.LatLngBounds();

        // var_lat = 48.8529369;
        // var_lng = 2.364178000000038;

        // var latlng0 = new google.maps.LatLng(var_lat, var_lng) ;

        // console.log(latlng0) ;

        var query = {};

        Tracker.autorun(function () {
            if ( Session.get('current_estate_doc') !== undefined) {
                current_estate = Session.get('current_estate_doc');
                // var portfolioIDs = Estates.findOne({_id: Session.get('current_estate_doc')._id}).portfolio_collection;
            }

            if ( Session.get('current_portfolio_doc') !== undefined) {
                query = {portfolio_id: Session.get('current_portfolio_doc')._id };
            }else  {
                query = {};
            };

            var buildingGeoList = [] ;

            Buildings.find(query).forEach(function(building) {

                if ( building.address.gps_lat !== undefined ) {

                    var latlng = new google.maps.LatLng(building.address.gps_lat, building.address.gps_long);
                    buildingGeoList.push( latlng );

                    // var_content = "Lat: " + building.address.gps_lat + " - long: " + building.address.gps_long;


                    // Build content for the infoWindow
                    var building_image_html = "";
                    if(building.images){
                        building_image = "/cfs/files/images/"+ building.images;
                        building_image_html = '<img src="' + building_image + '" width=80 class="img_marker">' ;
                    }
                    content_marker =
                        // '<div class="select_building">' +
                        '<a href="/buildings/' + building._id + '">' +
                            building_image_html +
                            '<b>' + building.building_name + "</b><br/>" +
                            building.address.street+' '+building.address.zip+' '+building.address.city+"<br/>" +
                            // "Lat: " + building.address.gps_lat + " - long: " + building.address.gps_long
                        '</a>'
                    ;

                    tmpl.newMap2.addMarker({
                      lat: building.address.gps_lat,
                      lng: building.address.gps_long,
                      title: building.building_name,
                      // click: function(e) {
                      //   alert('You clicked in this marker');
                      // }
                      infoWindow: {
                        content: content_marker
                      }
                    });

                }
                // console.log(estate.estate_name);
            });;

            tmpl.newMap2.fitLatLngBounds(buildingGeoList);
        });
        // address: addr(),

        // var latlng1 = "";

        // tmpl.mapEngine.geocode({
        //   address: addr(),
        //   callback: function(results, status) {
        //     if (status == 'OK') {
        //       var latlng = results[0].geometry.location;
        //       console.log(latlng);
        //       // tmpl.newMap2.setCenter(latlng.lat(), latlng.lng());

        //       // markerBounds.extend(latlng);

        //       tmpl.newMap2.addMarker({
        //         lat: latlng.lat(),
        //         lng: latlng.lng(),
        //         title: 'BSE',
        //         infoWindow: {
        //          content: var_content
        //         }
        //       });

        //       // var latlng1 = google.maps.LatLng(latlng.lat(), latlng.lng()) ;

        //       tmpl.newMap2.fitLatLngBounds([latlng0, latlng]);
        //     }
        //   }
        // });

        // tmpl.newMap2.fitLatLngBounds(markerBounds);
        // tmpl.newMap2.fitLatLngBounds([latlng0, ]);



        // tmpl.mapEngine.geocode({
        //   address: "Wrocław",
        //   callback: function(results, status) {
        //     tmpl.newMap3.removeMarkers();
        //     if (status == 'OK') {
        //       var latlng = results[0].geometry.location;
        //       tmpl.newMap3.setCenter(latlng.lat(), latlng.lng());
        //       tmpl.newMap3.addMarker({
        //         lat: latlng.lat(),
        //         lng: latlng.lng(),
        //         draggable: true,
        //         dragstart: function() {
        //           console.log('drag started');
        //         },
        //         dragend: function() {
        //           console.log('drag end')
        //         }
        //       });
        //     } else {
        //       console.log(status);
        //     }
        //   }
        // });

    });

};


Template.mapCanvas2.events({
    'submit form': function(e, tmpl) {
      e.preventDefault();
      var searchInput = $(e.target).find('#address');

      tmpl.newMap.removeMarkers();
      tmpl.mapEngine.geocode({
        address: searchInput.val(),
        callback: function(results, status) {
          if (status == 'OK') {
            var latlng = results[0].geometry.location;
            tmpl.newMap.setCenter(latlng.lat(), latlng.lng());
            tmpl.newMap.addMarker({
              lat: latlng.lat(),
              lng: latlng.lng(),
              draggable: true,
              dragend: function() {
                var point = this.getPosition();
                tmpl.mapEngine.geocode({location: point, callback: function(results) {
                  searchInput.val(results[0].formatted_address);
                  tmpl.newMap.setCenter(results[0].geometry.location.lat(), results[0].geometry.location.lng());
                }});
              }
            });
            searchInput.val(results[0].formatted_address);
          } else {
            console.log(status);
          }
        }
      });

    }
});
