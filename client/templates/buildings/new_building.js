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
            console.log('building_doc is: ');
            console.log(building_doc);

            building_doc.portfolio_id = Session.get('current_portfolio_doc')._id;


            Buildings.insert(building_doc, function(err, id) {
                if (err) {
                  this.done();
                } else {
                  Router.go('observatory', {
                    // _id: id
                  });
                }
              });
      }
    }]
  }
});
