# References
#- https://atmospherejs.com/vazco/maps
#- http://hpneo.github.io/gmaps/documentation.html
#- http://hpneo.github.io/gmaps/
#- https://github.com/hpneo/gmaps

mapOptions = styles: [
  { stylers: [saturation: -100] }
  {
    featureType: 'water'
    elementType: 'geometry.fill'
    stylers: [color: '#0099dd']
  }
  {
    elementType: 'labels'
    stylers: [visibility: 'off']
  }
  {
    featureType: 'poi.park'
    elementType: 'geometry.fill'
    stylers: [color: '#aadd55']
  }
  {
    featureType: 'road.highway'
    elementType: 'labels'
    stylers: [visibility: 'on']
  }
  {
    featureType: 'road.arterial'
    elementType: 'labels.text'
    stylers: [visibility: 'on']
  }
  {
    featureType: 'road.local'
    elementType: 'labels.text'
    stylers: [visibility: 'on']
  }
]

Template.map.destroyed = ->
  Session.set('obs_barchart_buildings', undefined)

Template.map.rendered = ->
  tmpl = this
  VazcoMaps.init {}, ->
    tmpl.mapEngine = VazcoMaps.gMaps()
    tmpl.newMap2 = new tmpl.mapEngine(
      div: '#map-canvas2'
      lat: 48.9096436
      lng: 2.4393542
      zoom: 6
      options: mapOptions
      panControl: false
    )

    # Construct the map in an autorun, so that the map is reactive
    tmpl.autorun ->
      # Start each run with a clean set of buildings
      buildings = Template.currentData().buildings
      # Remove all markers
      tmpl.newMap2.removeMarkers()

      # First: filter the building list if relevant
      # If a Portfolio is defined: only keep relevant buildings. Otherwise, keep them all
      if Session.get('current_portfolio_doc') isnt undefined
        buildings = _.where(buildings, {portfolio_id: Session.get('current_portfolio_doc')._id})
      # If the User clicks on a bar, the only keep relevant buildings
      if Session.get('obs_barchart_buildings')?
        buildings = _.filter(buildings, (building) ->
          return _.find(Session.get('obs_barchart_buildings'), (id) ->
              return building._id is id
          );
        )
      #   _.filter(aaa, function(a){
      #     return _.find(bbb, function(b){
      #         return b.id === a.id;
      #     });
      # });

      # Then build the buildingGeoList, ie. items in the map
      buildingGeoList = []
      for building in buildings
        if building.address.gps_lat isnt undefined
          latlng = new google.maps.LatLng(building.address.gps_lat, building.address.gps_long)
          buildingGeoList.push latlng
          # Build content for the infoWindow
          building_image_html = ''
          if building.images
            building_image = "/cfs/files/images/#{building.images}"
            building_image_html = "<img src=\"#{building_image}\" width=80 class=\"img_marker\">"
          content_marker = "<a href=\"/buildings/" + building._id + "\">" + building_image_html + "<b>" + building.building_name + "</b><br/>" + building.address.street + " " + building.address.zip + " " + building.address.city + "<br/>" + "</a>"
          tmpl.newMap2.addMarker
            lat: building.address.gps_lat
            lng: building.address.gps_long
            title: building.building_name
            animation: google.maps.Animation.DROP
            icon: '/icon/pin.svg'
            infoWindow:
              content: content_marker
      tmpl.newMap2.fitLatLngBounds buildingGeoList  if buildingGeoList.length >= 0

Template.map.events 'submit form': (e, tmpl) ->
  e.preventDefault()
  searchInput = $(e.target).find('#address')
  tmpl.newMap.removeMarkers()
  tmpl.mapEngine.geocode
    address: searchInput.val()
    callback: (results, status) ->
      if status is 'OK'
        latlng = results[0].geometry.location
        tmpl.newMap.setCenter latlng.lat(), latlng.lng()
        tmpl.newMap.addMarker
          lat: latlng.lat()
          lng: latlng.lng()
          draggable: true
          dragend: ->
            point = @getPosition()
            tmpl.mapEngine.geocode
              location: point
              callback: (results) ->
                searchInput.val results[0].formatted_address
                tmpl.newMap.setCenter results[0].geometry.location.lat(), results[0].geometry.location.lng()
        searchInput.val results[0].formatted_address
      else
        console.log status
