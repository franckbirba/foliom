# Using Collection hooks instead of Observe. BEWARE: hooks don't work when directly modifying MondoDB
Actions.after.insert (userId, doc) ->
  if doc.action_type is "generic" or doc.action_type is "user_template"
    manageActionLogos(doc.logo, "remove_logo") # remove new logo

Actions.after.remove (userId, doc) ->
  if doc.action_type is "generic" or doc.action_type is "user_template"
    manageActionLogos(doc.logo, "restore_logo") # restore previous logo

Actions.after.update ((userId, doc, fieldNames, modifier, options) ->
  if doc.logo isnt this.previous.logo # only change logos if new doc has a different logo
    manageActionLogos(this.previous.logo, "restore_logo") # restore previous logo
    manageActionLogos(doc.logo, "remove_logo") # remove new logo
), fetchPrevious: true

manageActionLogos = (logo, add_or_remove_logo) ->
  action_logo = logo # get used logo
  available_action_logos_array = Selectors.findOne({'name':'available_action_logos'}).labels # get array

  if add_or_remove_logo is "remove_logo"
    new_action_logos_array = _.difference available_action_logos_array, [action_logo] # Remove used logo from available list
  else if add_or_remove_logo is "restore_logo"
    new_action_logos_array = available_action_logos_array.concat([action_logo]) # Restore logo in available list

  Selectors.update {'name':'available_action_logos'},
    { $set: { labels: new_action_logos_array } }

  # console.log "available_action_logos.length is now #{new_action_logos_array.length}"
