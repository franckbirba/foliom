MINDATE = 2015
MAXDATE = 2046

first = true

Template.timelineDateSelection.created = ->
  Session.set 'timeline-date-selection-displayed', false

Template.timelineDateSelection.helpers
  isDateSelectionDisplayed: ->
    Session.get 'timeline-date-selection-displayed'
  dataValue: -> @action.start.format 'Q-YYYY'
  quarters: ->
    for idx in [1..4]
      name: "#{TAPi18n.__ 'quarter_abbreviation'}#{idx}"
      value: idx
      checked: idx is @action.start.quarter()
  years: ->
    for year in [MINDATE..MAXDATE]
      name: year
      value: year
      checked: year is @action.start.year()

Template.timelineDateSelection.events
  'click .quarter-content': (e, t) ->
    Session.set 'timeline-date-selection-displayed', true
    #console.log 'Display', e, t.data
    #t.$ '.date-selection'
    #.removeClass 'fadeOutUp'
    #.addClass 'fadeInDown'
  'click .validate': (e, t) -> removeDateSelection e, t
  'click .cancel': (e, t) -> removeDateSelection e, t

removeDateSelection = (e, t) ->
  Session.set 'timeline-date-selection-displayed', false
  #t.$ '.date-selection'
  #.removeClass 'fadeInDown'
  #.addClass 'fadeOutUp'
