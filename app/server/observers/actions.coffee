# Using Collection hooks instead of Observe. BEWARE: hooks don't work when directly modifying MondoDB
Actions.after.insert (userId, doc) ->
  manageActionLogos(doc.logo, "remove_logo")

Actions.after.remove (userId, doc) ->
  manageActionLogos(doc.logo, "restore_logo")

# WAIT! ONLY DO IT FOR GENERIC OR USER TEMPLATE ACTIONS


manageActionLogos = (logo, add_or_remove_logo) ->
  action_logo = logo # get used logo
  available_action_logos_array = Selectors.findOne({'name':'available_action_logos'}).labels # get array

  if add_or_remove_logo is "remove_logo"
    new_action_logos_array = _.difference available_action_logos_array, [action_logo] # Remove used logo from available list
  else if add_or_remove_logo is "restore_logo"
    new_action_logos_array = available_action_logos_array.concat([action_logo]) # Restore logo in available list

  Selectors.update {'name':'available_action_logos'},
    { $set: { labels: new_action_logos_array } }

  console.log "available_action_logos.length is now #{new_action_logos_array.length}"
