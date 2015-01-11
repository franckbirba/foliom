AutoForm.hooks({
    AFinsertPortfolioForm: {
        onSuccess: function(operation, result, template) {
            // console.log("Success : operation is " + operation);
            if (operation == "insert") {
                // $('#estateForm').modal('hide');

                 var currentEstateId = Session.get('current_estate_doc')._id;
                // console.log("portfolio_id should be: " + result);

                Estates.update(currentEstateId, { $push: { portfolio_collection: result } }, function(error) {
                  if (error) {
                    // display the error to the user
                    alert(error.reason);
                  }
                });



            } else if (operation == "update") {
                // $('#estateForm').modal('hide');
            }
        },
    }
});
