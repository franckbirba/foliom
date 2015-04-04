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
  'click [data-role=\'erase\']': (e, t) -> removeDateSelection e, t
  'click [data-role=\'validate\']': (e, t) ->
    quarter = Number (t.$ 'input[name=\'date-selection-quarter\']\
      :checked').val()
    year = Number (t.$ 'input[name=\'date-selection-year\']:checked').val()
    actionId = t.data.action.action_id
    pactions = TV.scenario.planned_actions
    idx = _.indexOf pactions, (_.findWhere pactions, {action_id: actionId})
    pactions[idx].start = moment
      second: 1 # @NOTE: A second is added so that inBetween evaluation works
      month: (quarter - 1) * 3
      year: year
    # Update DB
    formattedActions = _.map pactions, (paction) ->
      action_id: paction.action_id
      start: paction.start.toDate()
      efficiency_ratio: paction.efficiency_ratio
    # console.table formattedActions
    Scenarios.update {_id:TV.scenario._id},$set:planned_actions:formattedActions
    # Remove date selection once validation and update is finished
    removeDateSelection e, t
  'click [data-role=\'cancel\']': (e, t) -> removeDateSelection e, t

removeDateSelection = (e, t) -> t.rxIsDateSelectionDisplayed.set false
