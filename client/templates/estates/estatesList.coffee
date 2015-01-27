Template.estatesList.events
  'click .update_estate': ->
    Session.set 'update_estate_doc', @
    Session.set 'update_estate_var', true

  'click .insert_estate': ->
    Session.set 'update_estate_var', false
