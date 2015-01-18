Template.messageBox.rendered = ->
  @$('#messages').scrollTop $("#messages").prop('scrollHeight')
  Messages.find().observe added: (newDocument, oldDocument) ->
    $('#messages').scrollTop $('#messages').prop('scrollHeight')

Template.messageBox.helpers
  messages: ->
    filter = {}
    # @TODO @BSE Is filter on portfolio required?
    #currentPortfolio = Session.get 'current_portfolio_doc'
    #filter.portfolio_id = currentPortfolio if currentPortfolio?
    currentBuilding = Session.get 'current_building_doc'
    filter.building_id = currentBuilding._id if currentBuilding?
    (Messages.find filter, sort: time: 1).fetch()

Template.messageBox.helpers
  messagePlaceholder: -> TAPi18n.__ 'type_msg_here'
  prettifyDate: (timestamp) -> (moment timestamp).fromNow()

Template.messageBox.events =
  'keydown input#message': (e, t) ->
    return unless e.which is 13
    sendMessage t
  'click input#message': (e, t) -> sendMessage t

sendMessage = (t) ->
  user = Meteor.user()
  name =
    if user?
      "#{user.profile.firstName} - #{user.profile.lastName}"
    else
      'Anonymous'
  $message = t.find '#message'
  unless message.value is ''
    msgContent =
      name: name
      message: $message.value
      time: Date.now()
    currentBuilding = Session.get 'current_building_doc'
    msgContent.building_id = currentBuilding._id if currentBuilding
    Messages.insert msgContent
    $message.value = ''
