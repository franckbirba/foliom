# Local alias on the namespaced variables for the Timeline
TV = TimelineVars

Template.timelineDateSelection.created = ->
  @rxIsDateSelectionDisplayed = new ReactiveVar
  @rxIsDateSelectionDisplayed.set false

Template.timelineDateSelection.helpers
  isDateSelectionDisplayed: ->
    Template.instance().rxIsDateSelectionDisplayed.get()
  dataValue: -> @action.start.format 'Q-YYYY'
  quarters: ->
    for idx in [1..4]
      name: "#{TAPi18n.__ 'quarter_abbreviation'}#{idx}"
      value: idx
      checked: idx is @action.start.quarter()
  years: ->
    for year in [TV.minDate.year()..TV.maxDate.year()]
      name: year
      value: year
      checked: year is @action.start.year()

Template.timelineDateSelection.events
  'click .quarter-content': (e, t) ->
    t.rxIsDateSelectionDisplayed.set true
    Meteor.setTimeout ->
      $form = t.$ 'form.date-selection'
      containerHeight = ($ '.timeline.container').height()
      $form.css 'bottom', containerHeight + 20 - e.pageY
    , 0
  'click .validate': (e, t) -> removeDateSelection e, t
  'click .cancel': (e, t) -> removeDateSelection e, t

removeDateSelection = (e, t) -> t.rxIsDateSelectionDisplayed.set false
