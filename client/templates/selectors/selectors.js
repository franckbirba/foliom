Template.selectors.helpers({
    fluidTypesForCurrentEstate: function () {
        return Selectors.find({
            $or: [
                { // get fluidTypes that are generic (no estate_id)
                    "name": "fluid_type",
                    "estate_id": { $exists: false }
                },
                { // and get fluidTypes that are linked to this estate
                    "name": "fluid_type",
                    "estate_id": Session.get('current_estate_doc')._id
                 }
            ]
        }).fetch();
    },
  getFluidProviders: function () {
    return ;
  },
  beforeRemove: function () {
    return function (collection, id) {
      var doc = collection.findOne(id);
      if (confirm('Really delete "' + doc.fluid_type + ' ' +doc.fluid_provider+'"?')) {
        this.remove();
      }
    };
  },
});
