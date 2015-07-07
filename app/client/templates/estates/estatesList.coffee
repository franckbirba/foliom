Template.estatesList.events
  'click .update_estate': ->
    Session.set 'update_estate_doc', @
    Session.set 'update_estate_var', true
    $('#estateForm').modal 'show'

  'click .insert_estate': ->
    Session.set 'update_estate_var', false

Template.estatesList.helpers
  getPortfolios: (estate_id) ->
    portfolio_collection = Estates.findOne(estate_id).portfolio_collection
    return Portfolios.find({_id: {$in : portfolio_collection} },
                      {sort: {name:1}}
                      )
