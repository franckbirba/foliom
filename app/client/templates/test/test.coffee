MINDATE = 2015
MAXDATE = 2046

Template.test.helpers
  quarters: -> "#{TAPi18n.__ 'quarter_abbreviation'}#{idx}" for idx in [1..4]
  years: -> [MINDATE..MAXDATE]
