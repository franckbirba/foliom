Template.graygreenBar.rendered = ->
  bar = d3.select("#bar_global_lifetime").select("svg")

  height=15

  x_val = 0
  y_val = 20

  value = "35 %"
  triangle_color = "#7F7F7F"

  #text
  bar.append("text")
    .attr("x", x_val )
    .attr("y", y_val - 8 )
    .attr("dy", ".35em")
    .text( value )
    # .style("font-weight", "bold")
    .style("font-size", "0.9em" )
    .attr "fill", triangle_color

  #triangles
  bar.append('path')
    .attr("d", () ->
        # middle = (y(barHeight) - barVerticalSpacing)/2
        "M #{x_val} #{y_val} l #{height} 0 l -#{height/2} #{height} z"
      )
    .attr "fill", triangle_color



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
