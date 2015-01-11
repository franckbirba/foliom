Template.dpe.rendered = ->
  # Current selected building is set as 'this'
  buildingId = @data._id
  # @TODO Perform some calculations
  # Fake value
  dpeValue = 240
  # Get the indices
  dpeIncide = switch
    when dpeValue <= 50  then 'A'
    when dpeValue <= 90  then 'B'
    when dpeValue <= 150 then 'C'
    when dpeValue <= 230 then 'D'
    when dpeValue <= 330 then 'E'
    when dpeValue <= 450 then 'F'
    else 'G'
  # Set the appropriate indice in the chart
  dpe = $ "#dpe-path-#{dpeIncide}"
  dpe.attr 'fill', CHARTIST_COLORS[0]
