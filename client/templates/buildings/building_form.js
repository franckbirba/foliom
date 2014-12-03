AutoForm.hooks({
    AFinsertBuildingForm: {
        before: {
            insert: function(doc, template) {
                // doc.portfolio_id = Session.get('current_estate_doc')._id;
            }
            // update: function(docId, modifier, template) {},
            // "methodName": function(doc, template) {}

        }
        // onSuccess: function(operation, result, template) {
        //     // console.log("Success : operation is " + operation);
        //     if (operation == "insert") {
        //         $('#estateForm').modal('hide');
        //     } else if (operation == "update") {
        //         $('#estateForm').modal('hide');
        //     }
        // },
    }
});
