Template.messageBox.rendered = ->
  @$('#messages').scrollTop $("#messages").prop('scrollHeight')
  Messages.find().observe added: (newDocument, oldDocument) ->
    $('#messages').scrollTop $('#messages').prop('scrollHeight')

Template.messageBox.helpers messages: ->
  #{portfolio_id: Session.get('current_portfolio_doc')._id }
  Messages.find(
    building_id: Session.get('current_building_doc')._id
  , sort: time: 1
  ).fetch()

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
    Messages.insert
      name: name
      message: $message.value
      time: Date.now()
      building_id: (Session.get 'current_building_doc')._id
    $message.value = ''
