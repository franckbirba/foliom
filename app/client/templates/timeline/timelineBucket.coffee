# Local alias on the namespaced variables for the Timeline
TV = TimelineVars

# Set reactive vars when template is created
Template.timelineBucket.created = ->
  # Reset action bucket's display when entering screen
  @rxIsBucketDisplayed = new ReactiveVar
  @rxIsBucketDisplayed.set false
  # Reset action bucket filters
  @rxFilterAction = new ReactiveVar
  @rxFilterAction.set 'all'

###*
 * Object containing helper keys for the template.
###
Template.timelineBucket.helpers
  # Action bucket trigger
  isActionBucketDisplayed: -> Template.instance().rxIsBucketDisplayed.get()
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
    filter = Template.instance().rxFilterAction.get()
    rxPlannedActions = TV.rxPlannedActions.get()
    switch filter
      when 'planned'
        _.filter rxPlannedActions, (action) -> action.start?
      when 'unplanned'
        _.filter rxPlannedActions, (action) -> action.start is undefined
      else rxPlannedActions

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
      t.rxFilterAction.set $selected.attr 'data-value'
  'click [data-trigger=\'timeline-action-bucket-toggle\']': (e, t) ->
    $actionBucket = $ '.action-bucket'
    $actionBucketFooter = $ '.action-bucket-footer'
    # Display content of the action bucket
    if t.rxIsBucketDisplayed.get()
      # Toggle translation and wait for its end for
      # removing action's bucket content
      $actionBucket
      .removeClass 'action-bucket-displayed'
      .on TRANSITION_END_EVENT, ->
        t.rxIsBucketDisplayed.set false
      $actionBucketFooter.removeClass 'action-bucket-footer-displayed'
    else
      # Add action's bucket content before toggling animation
      t.rxIsBucketDisplayed.set true
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
        $selected = $btnGroup.find "[data-value=\'#{t.rxFilterAction.get()}\']"
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
  'dragstart [data-role=\'draggable-action-bucket\']': (e, t) ->
    e.stopPropagation()
    TV.dragged = t.$ e.target
