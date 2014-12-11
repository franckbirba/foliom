AutoForm.hooks({
    insertLeaseForm: {
        before: {
            insert: function(doc, template) {
                // doc.portfolio_id = Session.get('current_estate_doc')._id;
                doc.building_id = Session.get('current_building_id');
                return doc;
            }
            // update: function(docId, modifier, template) {},
            // "methodName": function(doc, template) {}

        },
        onSuccess: function(operation, result, template) {
            var nbLeases_2create = Session.get('nbLeases_2create');

            if(nbLeases_2create>1) {
                // One less lease to create, so we update the session var
                Session.set('nbLeases_2create', nbLeases_2create-1);

                Router.go('leaseForm', {
                            // _id: id
                        });
            } else {
                Session.set('nbLeases_2create', 0);
                Router.go('buildingDetail', {_id: Session.get('current_building_id') });
            }


        },
    }
});
