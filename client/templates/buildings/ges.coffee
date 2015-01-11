Template.ges.rendered = ->
  # Current selected building is set as 'this'
  buildingId = @data._id
  # @TODO Perform some calculations
  # Fake value
  gesValue = 15
  # Get the indices
  gesIndice = switch
    when gesValue <= 5  then 'A'
    when gesValue <= 10 then 'B'
    when gesValue <= 20 then 'C'
    when gesValue <= 35 then 'D'
    when gesValue <= 55 then 'E'
    when gesValue <= 80 then 'F'
    else 'G'
  # Set the appropriate indice in the chart
  ges = $ "#ges-path-#{gesIndice}"
  ges.attr 'fill', CHARTIST_COLORS[0]
