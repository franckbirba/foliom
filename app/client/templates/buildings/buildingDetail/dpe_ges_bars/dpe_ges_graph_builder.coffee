@graphBuilder = (type, data) ->
  dpeData = dpe_scale[data.dpe_type][type] #get corresponding json in Scale

  width = 220
  height = 220
  barHeight = 31
  barVerticalSpacing = 2

  #Test to remove bars and redraw them
  d3.select("##{type}-svg").selectAll("g").remove()

  chart = d3.select("##{type}-svg")
        # Make SVG responsive
        .attr 'preserveAspectRatio', 'xMinYMin meet'
        .attr "viewBox", "0 0 #{width} #{height}"

  # d3.select("svg")
  #       .remove();

  if type is "dpe"
    width_withTriangle = width - 20 # ugly way of adjusting
  else
    width_withTriangle = width

  x = d3.scale.linear()
      .domain([0, d3.max(dpeData, (d) -> return d.value )])
      .range([0, width_withTriangle])

  y = d3.scale.linear()
      .domain([0, d3.max(dpeData, (d, i) -> return (i+1) * barHeight )])
      .range([0, height])


  bar = chart.selectAll("g")
          .data(dpeData)
        .enter().append("g")
          .attr("transform", (d, i) -> return "translate(0," + y(i * barHeight) + ")" )


  if type is "dpe"
    # Draw bar with pointy end
    bar.append('path')
        .attr("d", (d,i) ->
            bar_width = x(d.value)
            middle = (y(barHeight) - barVerticalSpacing)/2
            "M 0 0 l #{bar_width} 0 l #{middle} #{middle} l -#{middle} #{middle} l -#{bar_width} 0 z"
          )
        .attr "fill", (d)-> d.color
        .attr("class", (d)-> "dpe-path-#{d.letter}" )
  else
    bar.append("rect")
      .attr("width", (d) -> return x(d.value) )
      .attr("height", y(barHeight) - barVerticalSpacing)
      .attr("fill", (d)-> d.color)
      .attr("class", (d)-> "ges-path-#{d.letter}" )


  # Text: Letter
  bar.append("text")
      .attr("x", (d) -> return x(d.value) - 15 )
      .attr("y", y(barHeight)/2 )
      .attr("dy", ".35em")
      .text( (d) -> return d.letter )
      .style("font-weight", "bold")
      .style("font-size", (d)-> if d.length is 7 then "1.4em" else "1.1em" )
      .attr "fill", (d)-> d.textColor

  # Text: Label
  bar.append("text")
      .attr("x", 5 )
      .attr("y", y(barHeight)/2 )
      .attr("dy", ".35em")
      .text( (d) -> return d.label )
      .style("font-weight", "bold")
      .style("font-size", (d)-> if d.length is 7 then "1.1em" else "0.7em" )
      .attr "fill", (d)-> d.textColor

  dpeValue = if type is "dpe" then data.dpe_energy_consuption.value else data.dpe_co2_emission.value
  dpeLetter = parseDpeGesScale(type, data.dpe_type, dpeValue)

  # Set the appropriate indice in the chart
  dpe = $ ".#{type}-path-#{dpeLetter}"
  dpe.attr 'fill', COLORS[0]
