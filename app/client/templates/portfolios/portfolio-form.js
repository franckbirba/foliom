AutoForm.hooks({
    AFinsertPortfolioForm: {
        onSuccess: function(formType, result) {
            // console.log("Success : formType is " + formType);
            if (formType == "insert") {

                var currentEstateId = Session.get('current_estate_doc')._id;

                Estates.update(currentEstateId, { $push: { portfolio_collection: result } }, function(error) {
                  if (error) {
                    // display the error to the user
                    alert(error.reason);
                  }
                });

                // Update current_estate_doc
                Session.set('current_estate_doc', Estates.findOne(currentEstateId));

                $('#portfolioForm').modal('hide');

            } else if (formType == "update") {
                $('#portfolioForm').modal('hide');
            }
        },
    }
});
