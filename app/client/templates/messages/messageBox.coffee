scroll = ->
  $msgs = $ '#messages'
  $msgs.scrollTop 20 + ($msgs.prop 'scrollHeight')
  $msgs.children().children().last().toggleClass 'mLightSpeedIn'

# Debounce scroll by one frame
debouncedScroll = _.debounce scroll, 16, false

Template.messageBox.rendered = ->
  $msgs = @$('#messages')
  $msgs.scrollTop ($msgs.prop 'scrollHeight')
  Messages.find().observeChanges
    added: (newDocument, oldDocument) ->
      debouncedScroll()

Template.messageBox.helpers
  messages: ->
    filter = {}
    currentBuilding = Session.get 'current_building_doc'
    filter.building_id = currentBuilding._id if currentBuilding?
    (Messages.find filter, sort: time: 1).fetch()
  prettifyDate: (timestamp) -> (moment timestamp).fromNow()
  hasLink: (link) -> link?
  isBuildingDetailTplt: -> Router.current().route.getName() is 'building-detail'

Template.messageBox.events =
  'keydown input#message': (e, t) ->
    return unless e.which is 13
    sendMessage t
  'click input#message': (e, t) -> sendMessage t

sendMessage = (t) ->
  user = Meteor.user()
  name =
    if user?
      "#{user.profile.firstName} #{user.profile.lastName}"
    else
      'Anonymous'
  $message = t.find '#message'
  unless message.value is ''
    msgContent =
      name: name
      message: $message.value
      time: Date.now()
    if Router.current().route.getName() is 'building-detail'
      currentBuilding = Session.get 'current_building_doc'
    msgContent.building_id = currentBuilding._id if currentBuilding
    Messages.insert msgContent
    $message.value = ''
