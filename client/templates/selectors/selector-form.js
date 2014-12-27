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
            $('#selectorFormModal').modal('hide');
        },
    }
});

Template.selectors.helpers({
    getFormType: function(){
        var update_selector = Session.get('update_selector');
        return update_selector ? "insert" : "update";
    },
    getUser: function(){
        return Session.get('update_user') ? Session.get('update_user') : null;
    },
});
