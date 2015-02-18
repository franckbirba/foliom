Template.dpe.rendered = ->
  # Current selected building is set as 'this'
  buildingId = @data._id
  # @TODO Perform some calculations

  width = 220
  height = 220
  barHeight = 31
  barVerticalSpacing = 2

  #Text Data Set
  dpeData = [
    { "label": "≤ 50", "letter": "A", "color" : "#555753", "textColor":"white", "value": 30 },
    { "label": "51 - 90", "letter": "B", "color" : "#888a85", "textColor":"black", "value": 40 },
    { "label": "91 - 150", "letter": "C", "color" : "#babdb6", "textColor":"black", "value": 50 },
    { "label": "151 - 230", "letter": "D", "color" : "#d3d7cf", "textColor":"black", "value": 60 },
    { "label": "231 - 330", "letter": "E", "color" : "#babdb6", "textColor":"black", "value": 70 },
    { "label": "331 - 450", "letter": "F", "color" : "#888a85", "textColor":"black", "value": 80 },
    { "label": "≥ 451", "letter": "G", "color" : "#555753", "textColor":"white", "value": 90 },
    # { "label": "≥ 451", "letter": "H", "color" : "#4d4d4d", "textColor":"white", "value": 100 },
    # { "label": "≥ 451", "letter": "I", "color" : "#333", "textColor":"white", "value": 110 },
  ]

  chart = d3.select("#dpe-svg")
        .attr "viewBox", "0 0 #{width} #{height}"
      # .attr("width", width)
      # .attr("height", height)

  width_withTriangle = width - 20 # ugly way of adjusting
  x = d3.scale.linear()
      .domain([0, d3.max(dpeData, (d) -> return d.value )])
      .range([0, width_withTriangle])

  y = d3.scale.linear()
      .domain([0, d3.max(dpeData, (d, i) -> return (i+1) * barHeight )])
      .range([0, height])


  chart.attr("height", barHeight * dpeData.length)

  bar = chart.selectAll("g")
          .data(dpeData)
        .enter().append("g")
          .attr("transform", (d, i) -> return "translate(0," + y(i * barHeight) + ")" )

  bar.append("rect")
      .attr("width", (d) -> return x(d.value) )
      .attr("height", y(barHeight) - barVerticalSpacing)
      .attr("fill", (d)-> d.color)
      .attr("class", (d)-> "dpe-path-#{d.letter}" )

  #triangles
  bar.append('path')
      .attr("d", (d,i) ->
          x_val = x(d.value) - 0.5 #ugly way of preventing a very small gap
          y_val = 0
          middle = (y(barHeight) - barVerticalSpacing)/2
          "M #{x_val} #{y_val} l #{middle} #{middle} l -#{middle} #{middle} z"
        )
      .attr "fill", (d)-> d.color
      .attr("class", (d)-> "dpe-path-#{d.letter}" )

  bar.append("text")
      .attr("x", (d) -> return x(d.value) - 15 )
      .attr("y", y(barHeight)/2 )
      .attr("dy", ".35em")
      .text( (d) -> return d.letter )
      .style("font-weight", "bold")
      .style("font-size", (d)-> if d.length is 7 then "1.4em" else "1.1em" )
      .attr "fill", (d)-> d.textColor

  bar.append("text")
      .attr("x", 5 )
      .attr("y", y(barHeight)/2 )
      .attr("dy", ".35em")
      .text( (d) -> return d.label )
      .style("font-weight", "bold")
      .style("font-size", (d)-> if d.length is 7 then "1.1em" else "0.7em" )
      .attr "fill", (d)-> d.textColor


 # Simple text test

  # xPadding = 1.5
  # initialLine = 9
  # lineInterval = 14.5

  # dpeSvg = d3.select("#dpe-svg")

  # text = dpeSvg.selectAll("text")
  #               .data(dpeData)
  #               .enter()
  #               .append("text")

  # textLabels = text
  #                 .attr("x", xPadding)
  #                 .attr("y", (d,i)-> initialLine + lineInterval*i )
  #                 .text( (d)-> d.label )
  #                 .attr("font-family", "sans-serif")
  #                 .attr("font-size", "6px")
  #                 .attr("fill", (d)-> d.color)
  #                 .style("font-weight", "bold")

  # text2 = dpeSvg.selectAll("text2")
  #               .data(dpeData)
  #               .enter()
  #               .append("text")

  # letterLabels = text2
  #                 .attr("x", (d,i)-> 14.5 + 10*i )
  #                 .attr("y", (d,i)-> initialLine + lineInterval*i )
  #                 .text( (d)-> d.letter )
  #                 .attr("font-family", "sans-serif")
  #                 .attr("font-size", "8px")
  #                 .attr("fill", (d)-> d.color)
  #                 .style("font-weight", "bold")



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
  dpe = $ ".dpe-path-#{dpeIncide}"
  dpe.attr 'fill', CHARTIST_COLORS[0]
