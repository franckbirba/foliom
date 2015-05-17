AutoForm.hooks({
    AFselectorForm: {
        before: {
            insert: function(doc) {
                doc.name = Session.get('selectorType');
                doc.estate_id = Session.get('current_estate_doc')._id;
                return doc;
            }
        },
        onSuccess: function(formType, result) {
            $('#selectorFormModal').modal('hide');
            Session.set('selectorType', null);
        },
    }
});


Template.SelectorForm.helpers({
    getFormType: function(){
        var update_selector = Session.get('update_selector');
        return update_selector ? "update" : "insert";
    },
    // getUser: function(){
    //     return Session.get('update_user') ? Session.get('update_user') : null;
    // },

});
