Template.graygreenBar.rendered = ->
  bar = d3.select("#bar_global_lifetime").select("svg")

  height=20


  x_val = 0
  y_val = 13
  half_height = height/2

  #triangles
  bar.append('path')
    .attr("d", () ->
        # middle = (y(barHeight) - barVerticalSpacing)/2
        "M #{x_val} #{y_val} l #{height} 0 l -#{half_height} #{half_height} z"
      )
    .attr "fill", "#7F7F7F"

  # bar.append("text")
  #   .attr("x", x_val )
  #   .attr("y", y(barHeight)/2 )
  #   .attr("dy", ".35em")
  #   .text( (d) -> return d.letter )
  #   .style("font-weight", "bold")
  #   .style("font-size", (d)-> if d.length is 7 then "1.4em" else "1.1em" )
  #   .attr "fill", (d)-> d.textColor

  # #triangles
  # bar.append('path')
  #     .attr("d", (d,i) ->
  #         x_val = x(d.value) - 0.5 #ugly way of preventing a very small gap
  #         y_val = 0
  #         middle = (y(barHeight) - barVerticalSpacing)/2
  #         "M #{x_val} #{y_val} l #{middle} #{middle} l -#{middle} #{middle} z"
  #       )
  #     .attr "fill", (d)-> d.color
  #     .attr("class", (d)-> "dpe-path-#{d.letter}" )
