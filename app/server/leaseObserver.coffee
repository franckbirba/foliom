#Each time a new lease is inserted, save the technical_compliance categories
# Leases.find().observeChanges
#   added: (id, entry) ->

#     #Save all technical_compliance categories NAMES
#     curr_portfolio_id = Buildings.findOne(entry.building_id).portfolio_id
#     curr_estate = Estates.findOne({portfolio_collection: curr_portfolio_id })

#     all_categories = _.pluck entry.technical_compliance.categories, 'name' #get all catogorie names
#     unique_names = _.union curr_estate.estate_properties.technical_compliance_categoriesList, all_categories #remove all duplicates

#     Estates.update {_id: curr_estate._id}, {
#       $set: {'estate_properties.technical_compliance_categoriesList': unique_names}
#     }
