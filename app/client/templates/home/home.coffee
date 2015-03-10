Template.home.helpers username: ->
  Meteor.user() and Meteor.user().emails.shift().address

Template.home.created = ->
  # Ensure the mesageBox is unfiltered
  Session.set 'current_building_doc', undefined

# On Template rendered: Display Modal to choose Estate if Session Var is empty
# and User is linked to multiple Estates
Template.home.rendered = ->
  currentEstate = Session.get 'current_estate_doc'
  if Meteor.user().roles.indexOf('admin')>=0 and currentEstate is undefined
    @$('#SelectEstateForm').modal 'show'
