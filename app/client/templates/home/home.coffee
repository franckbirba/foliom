Template.home.events
  'click .sextan': -> Router.go 'observatory'
  'click .compass': -> Router.go 'actions-home'

Template.home.helpers username: ->
  Meteor.user() and Meteor.user().emails.shift().address

Template.home.created = ->
  # Ensure the mesageBox is unfiltered
  Session.set 'current_building_doc', undefined

# On Template rendered: Display Modal to choose Estate if Session Var is empty
# and User is linked to multiple Estates
Template.home.rendered = ->
  new WOW().init()
  # Create fake chart as the followup tool
  maxVal = Math.round 10*Math.PI
  xValue = [0...maxVal]
  serie1 = _.map xValue, (num) -> Math.cos num / 4
  serie2 = _.map xValue, (num) -> Math.sin num / 4
  new Chartist.Line '#followup-chart'
  ,
    labels: xValue
    series: [ serie1, serie2 ]
  ,
    showPoint: true
    axisX: showLabel: false, showGrid: false
    axisY: showLabel: false, showGrid: false
  # FBI: commented annoying behavior
  currentEstate = Session.get 'current_estate_doc'
  if Meteor.user().roles.indexOf('admin')>=0 and currentEstate is undefined
    @$('#SelectEstateForm').modal 'show'
