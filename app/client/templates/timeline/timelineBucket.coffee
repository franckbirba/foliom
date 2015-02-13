# Local alias on the namespaced variables for the Timeline
TV = TimelineVars

# Action bucket is hidden by default
Session.set 'timeline-action-bucket-displayed', false

Template.timelineBucket.created = ->
  # Reset action bucket's display when entering screen
  Session.set 'timeline-action-bucket-displayed', false
  # Reset action bucket filters
  Session.set 'timeline-filter-actions', 'all'

###*
 * Object containing helper keys for the template.
###
Template.timelineBucket.helpers
  # Action bucket trigger
  isActionBucketDisplayed: -> Session.get 'timeline-action-bucket-displayed'
  # Action bucket's exports as table
  actionBucketTableHeadings: -> [
    TAPi18n.__ 'quarter'
    TAPi18n.__ 'action_type'
    TAPi18n.__ 'building'
    '€'
    "#{TAPi18n.__ 'efficiency'} (%)"
    "#{TAPi18n.__ 'efficiency'} (kWh)"
    'TRI'
  ]
  actionBucketTableBody: ->
    console.log 'TimelineVars', TV
    filter = Session.get 'timeline-filter-actions'
    # @FIXME rxActions = TV.rxActions.get()
    rxActions = TV.actions
    switch filter
      when 'planned'
        _.filter rxActions, (action) -> action.start?
      when 'unplanned'
        _.filter rxActions, (action) -> action.start is undefined
      else rxActions

###*
 * Object containing event actions for the template.
###
Template.timelineBucket.events
  # Change filter on action bucket
  'click [data-role=\'filter-actions\']': (e, t) ->
    $btnGroup = t.$ '[data-role=\'filter-actions\']'
    $selected = $ e.target
    value = $selected.attr 'data-value'
    unless value is undefined
      $btnGroup.children().removeClass 'active'
      $selected.addClass 'active'
      Session.set 'timeline-filter-actions', $selected.attr 'data-value'
  # Click on action bucket items for quarter modification
  'click .quarter-select': (e, t) ->
    console.log 'Modify current selected quarter', e, t
    (t.$ e.currentTarget).toggleClass 'quarter-selected'
  'click [data-trigger=\'timeline-action-bucket-toggle\']': (e, t) ->
    $actionBucket = $ '.action-bucket'
    $actionBucketFooter = $ '.action-bucket-footer'
    # Display content of the action bucket
    isDisplayed = Session.get 'timeline-action-bucket-displayed'
    if isDisplayed
      # Toggle translation and wait for its end for
      # removing action's bucket content
      $actionBucket
      .removeClass 'action-bucket-displayed'
      .on TRANSITION_END_EVENT, ->
        Session.set 'timeline-action-bucket-displayed', false
      $actionBucketFooter.removeClass 'action-bucket-footer-displayed'
    else
      # Add action's bucket content before toggling animation
      Session.set 'timeline-action-bucket-displayed', true
      $actionBucket
      .off TRANSITION_END_EVENT
      .addClass 'action-bucket-displayed'
      $actionBucketFooter.addClass 'action-bucket-footer-displayed'
      # @NOTE Reactivity triggers DOM insertion, thus setting the state of the
      #  button's group must wait so that all elements are inserted. The same
      #  goes for attaching the draggable properties to the action's rows.
      Meteor.setTimeout ->
        # Set the appropriate filter button
        $btnGroup = $actionBucket.find '[data-role=\'filter-actions\']'
        $btnGroup.children().removeClass 'active'
        $selected = $btnGroup.find \
          "[data-value=\'#{Session.get 'timeline-filter-actions'}\']"
        $selected.addClass 'active'
        # Set row as draggable
        ($ '[data-role=\'draggable-action-bucket\']').draggable
          helper: 'clone'
          cursor: '-webkit-grabbing'
          scrollSensitivity: 100
          scrollSpeed: 100
          containment: 'table.timeline.timeline-year-table'
          revert: 'invalid'
      , 0
    # Change arrow orientation
    $actionBucket.find '.action-bucket-arrow-icon'
    .toggleClass 'glyphicon-circle-arrow-up'
    .toggleClass 'glyphicon-circle-arrow-down'
