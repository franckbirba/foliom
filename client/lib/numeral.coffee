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

# Switch to french language by default
numeral.language 'fr'
