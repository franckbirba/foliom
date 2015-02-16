MINDATE = 2015
MAXDATE = 2046

Template.test.helpers
  quarters: -> "#{TAPi18n.__ 'quarter_abbreviation'}#{idx}" for idx in [1..4]
  years: -> [MINDATE..MAXDATE]

Template.test.events
  'click .quarter-content': (e, t) ->
    t.$ '.date-selection'
    .removeClass 'fadeOutUp'
    .addClass 'fadeInDown'
  'click .validate': (e, t) ->
    removeDateSelection e, t
  'click .cancel': (e, t) -> removeDateSelection e, t

removeDateSelection = (e, t) ->
  t.$ '.date-selection'
  .removeClass 'fadeInDown'
  .addClass 'fadeOutUp'
