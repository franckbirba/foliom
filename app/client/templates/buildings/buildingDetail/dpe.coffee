Template.dpe.rendered = ->
  # Current selected building is set as 'this'
  buildingId = @data._id

  this.autorun =>
    lease_dpe_data = Template.currentData().dpe_data #Reactive Data source (@data is not reactive)

    if lease_dpe_data?
      console.log "lease_dpe_data is"
      console.log lease_dpe_data

      # @TODO Perform some calculations

      dpeData = dpe_scale[lease_dpe_data.dpe_type].dpe
      console.log "dpeData is"
      console.log dpeData

      width = 220
      height = 220
      barHeight = 31
      barVerticalSpacing = 2

      #Test to remove bars and redraw them
      d3.select("#dpe-svg").selectAll("g").remove()

      chart = d3.select("#dpe-svg")
            # Make SVG responsive
            .attr 'preserveAspectRatio', 'xMinYMin meet'
            .attr "viewBox", "0 0 #{width} #{height}"

      # d3.select("svg")
      #       .remove();


      width_withTriangle = width - 20 # ugly way of adjusting
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

      # bar.append("rect")
      #     .attr("width", (d) -> return x(d.value) )
      #     .attr("height", y(barHeight) - barVerticalSpacing)
      #     .attr("fill", (d)-> d.color)
      #     .attr("class", (d)-> "dpe-path-#{d.letter}" )


      # Draw bar with pointy end
      bar.append('path')
          .attr("d", (d,i) ->
              bar_width = x(d.value)
              middle = (y(barHeight) - barVerticalSpacing)/2
              "M 0 0 l #{bar_width} 0 l #{middle} #{middle} l -#{middle} #{middle} l -#{bar_width} 0 z"
            )
          .attr "fill", (d)-> d.color
          .attr("class", (d)-> "dpe-path-#{d.letter}" )

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


      dpeValue = lease_dpe_data.dpe_energy_consuption.value
      parseDpeGesScale("dpe", lease_dpe_data.dpe_type, dpeValue)



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
      dpe.attr 'fill', COLORS[0]
