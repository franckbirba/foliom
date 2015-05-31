Template.home.helpers
  username: ->
    user_profile = Meteor.user().profile
    return "#{user_profile.firstName} #{user_profile.lastName}"

Template.home.created = ->
  # Ensure the mesageBox is unfiltered
  Session.set 'current_building_doc', undefined
