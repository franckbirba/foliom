AutoForm.hooks({
    AFselectorForm: {
        before: {
            insert: function(doc, template) {
                doc.estate_id = Session.get('current_estate_doc')._id;
                return doc;
            }
            // update: function(docId, modifier, template) {},
            // "methodName": function(doc, template) {}

        },
        onSuccess: function(operation, result, template) {

            if (operation == "insert") {
                // $('#estateForm').modal('hide');

            } else if (operation == "update") {
                $('#estateForm').modal('hide');
            }
        },
    }
});
