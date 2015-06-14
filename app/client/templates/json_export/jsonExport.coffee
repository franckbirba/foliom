Template.jsonExport.events
  'click #json_export': (e)->
    e.preventDefault()

    curr_estate = Session.get('current_estate_doc')

    estates = JSON.stringify( Estates.find(curr_estate._id).fetch() )
    portfolios = JSON.stringify( Portfolios.find().fetch() )
    buildings = JSON.stringify( Buildings.find().fetch() )
    leases = JSON.stringify( Leases.find().fetch() )
    actions = JSON.stringify( Actions.find().fetch() )
    scenarios = JSON.stringify( Scenarios.find().fetch() )

    messages = JSON.stringify( Messages.find().fetch() )
    selectors = JSON.stringify( Selectors.find().fetch() )
    configurations = JSON.stringify( Session.get('current_config') )

    users = JSON.stringify( Meteor.users.find({_id: {$in : curr_estate.users}}, {fields: {services: 0}}).fetch() )

    blob = new Blob([
        "#{TAPi18n.__('estates')}\n",
        estates,
        "\n\n#{TAPi18n.__('portfolios')}\n",
        portfolios,
        "\n\n#{TAPi18n.__('buildings')}\n",
        buildings,
        "\n\n#{TAPi18n.__('leases')}\n",
        leases,
        "\n\n#{TAPi18n.__('actions_collection')}\n",
        actions,
        "\n\n#{TAPi18n.__('scenarios')}\n",
        scenarios,
        "\n\n#{TAPi18n.__('messages')}\n",
        messages,
        "\n\n#{TAPi18n.__('settings_selectors')}\n",
        selectors,
        "\n\n#{TAPi18n.__('settings_indexes')}\n",
        configurations,
        "\n\n#{TAPi18n.__('user_collection')}\n",
        users
      ], {type: "text/plain;charset=utf-8"})

    saveAs(blob, "eportfolio - #{curr_estate.estate_name} - data.txt")
