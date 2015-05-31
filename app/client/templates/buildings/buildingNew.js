LeaseNumber = new Mongo.Collection("LeaseNumber");
LeaseNumber.attachSchema(new SimpleSchema({
  one_lease: {
    type: Boolean,
    autoform: {
      type: "boolean-radios",
      trueLabel: transr("multiple_uses"),
      falseLabel: transr("one_use"),
      value: false
    },
    // allowedValues: [transr("one_use"), transr("multiple_uses")],
    label: transr("the_building"),
  },
  n_lease: {
    type: String,
    optional: true,
    label: transr("usage_number")
  }
}));

Template.buildingNew.rendered = function() {
  // Hide the steps that are automatically added by the Wizard
  $(".steps").hide();
};

Template.buildingNew.helpers({
  steps: function() {
    return [{
      id: 'genral_info',
      title: 'Informations',
      template: 'building-stepform-general-tplt',
      formId: 'building-stepform-general'
    },{
      id: 'leaseNb',
      title: 'Number of leases',
      template: 'building-stepform-leaseNb-tplt',
      formId: 'building-stepform-leaseNb',
      onSubmit: function(data, wizard) {
        building_doc = wizard.mergedData() ;

        building_doc.portfolio_id = Session.get('current_portfolio_doc')._id;

        // Geocoding
        var tmpl = this;
        VazcoMaps.init({}, function() {
          tmpl.mapEngine = VazcoMaps.gMaps();

          var tmp_address = building_doc.address.street + " " + building_doc.address.city + " " + building_doc.address.country;

          tmpl.mapEngine.geocode({
            address: tmp_address,
            callback: function(results, status) {
              if (status == 'OK') {
                var latlng;
                // If no gps_long has been entered, use the geocode result
                if (!building_doc.address.hasOwnProperty('gps_long')){
                  var latlng = results[0].geometry.location;
                  building_doc.address.gps_lat = latlng.lat();
                  building_doc.address.gps_long = latlng.lng();
                }

                Buildings.insert(building_doc, function(err, id) {
                  if (err) {
                    this.done();
                  } else {
                    //Set current building doc to the one we just created
                    var curr_building = Buildings.findOne(id);
                    Session.set('current_building_doc', curr_building);

                    var nbL_create = AutoForm.getFormValues('building-stepform-leaseNb').insertDoc.n_lease ;

                    // If field is set: store the value in a session var
                    if (nbL_create) {
                        Session.set('nbLeases_2create', nbL_create);
                    } else { // Else: 1 Lease to create
                        Session.set('nbLeases_2create', 1);
                        // We use a session var to save the fact that we'll only create one lease
                        Session.set('nbLeases_2create_onlyOne', true);
                    }

                    // console.log('nb of Leases to create: '+ Session.get('nbLeases_2create') );
                    Router.go('leaseForm', {
                        // _id: id
                    });
                  }
                });

              }
            }
          });

        });
      },
    }]
  }
});
