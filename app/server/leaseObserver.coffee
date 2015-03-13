#Each time a new lease is inserted, save the technical_compliance categories
Leases.find().observeChanges
  changed:(id, fields) ->

    # #Save all technical_compliance categories NAMES
    # curr_portfolio_id = Buildings.findOne(entry.building_id).portfolio_id
    # curr_estate = Estates.findOne({portfolio_collection: curr_portfolio_id })

    # all_categories = _.pluck entry.technical_compliance.categories, 'name' #get all catogorie names
    # unique_names = _.union curr_estate.estate_properties.technical_compliance_categoriesList, all_categories #remove all duplicates

    # Estates.update {_id: curr_estate._id}, {
    #   $set: {'estate_properties.technical_compliance_categoriesList': unique_names}
    # }

    alerts = _.where(fields.conformity_information, {diagnostic_alert: true})

    if alerts.length > 0
      lease_name = Leases.findOne({_id:id}).lease_name
      building_name = buildingName_fromLeaseId(id)
      building_id = buildingId_fromLeaseId(id)
      today = new Date

      for key, value of fields.conformity_information
        if value.diagnostic_alert is true
          msgTxt = "Alert - Lease #{lease_name}: last diagnostic for #{key} is obsolete"
          msgContent =
            name: 'EGIS-notifications'
            message: msgTxt
            time: today
            # link: entry.link
            # feed_id: id
            building_id: building_id

          Messages.upsert {time: today, message: msgTxt, building_id: building_id}, {$set: msgContent}

