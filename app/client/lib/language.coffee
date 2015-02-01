# Configuration for numeral.js
numeral.language 'fr',
  delimiters:
    thousands: ' '
    decimal: ','
  abbreviations:
    thousand: 'k'
    million: 'm'
    billion: 'b'
    trillion: 't'
  ordinal: (number) ->
    if number is 1 then 'er' else 'ème'
  currency:
    symbol: '€'

# Global function for easing language settings
@setLanguage = (lang) ->
  TAPi18n.setLanguage lang
  moment.locale lang
  numeral.language lang
  accountsUIBootstrap3.setLanguage lang
