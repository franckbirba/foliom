Template.itemBlockMedium.helpers
  isAllowedToEditAction: ->
    console.log @
    # On
    if @action_type is "generic"
      if (Meteor.user().roles.indexOf('admin') >= 0) is true
        return true
    else
      return true

