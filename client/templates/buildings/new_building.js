LeaseNumber = new Mongo.Collection("LeaseNumber");
LeaseNumber.attachSchema(new SimpleSchema({
  one_lease: {
    type: String,
    allowedValues: ["Dispose d’un seul usage", "Dispose de plusieurs usages"],
    label: "Le Batiment",
  },
  n_lease: {
    type: String,
    optional: true,
    label: "Nombre d'usages"
  }
}));

Template.newBuilding.helpers({
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


                Buildings.insert(building_doc, function(err, id) {
                    if (err) {
                      this.done();
                    } else {

                        //Set current building doc to the one we just created
                        Session.set('current_building_id', id);
                        console.log('new building _id is: '+ Session.get('current_building_id') );

                        var nbL_create = AutoForm.getFormValues('building-stepform-leaseNb').insertDoc.n_lease ;

                        // If field is set: store the value in a session var
                        if (nbL_create) {
                            Session.set('nbLeases_2create', nbL_create);
                        } else { // Else: 1 Lease to create
                            Session.set('nbLeases_2create', 1);
                        }

                        console.log('nb of Leases to create: '+ Session.get('nbLeases_2create') );

                        Router.go('leaseForm', {
                            // _id: id
                        });
                    }
                  });
            },
    }]
  }
});
