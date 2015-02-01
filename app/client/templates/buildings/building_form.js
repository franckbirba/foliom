AutoForm.hooks({
    AFbuildingForm: {
        before: {
            insert: function(doc, template) {
                doc.portfolio_id = Session.get('current_portfolio_doc')._id;;
                return doc;
            }
        }
    }
});
