Template.graygreenBar.rendered = () ->
  #the barId is passed when calling the template. It's accessible in @data

  # bar = d3.select("#bar_global_lifetime").select("svg")
  bar = d3.select("#{@data.barId}").select("svg")

  height=14

  x_val = 5
  y_val = 20

  value = "35"
  triangle_color = "#7F7F7F"

  #Create group
  g = bar.append('g')

  #Append text to group
  g.append("text")
    .attr("x", x_val )
    .attr("y", y_val - 8 )
    .attr("dy", ".35em")
    .text( value )
    # .style("font-weight", "bold")
    .style("font-size", "0.8em" )
    .attr "fill", triangle_color

  g.append("text")
    .attr("x", x_val + 15 )
    .attr("y", y_val - 8 )
    .attr("dy", ".35em")
    .text( "%" )
    # .style("font-weight", "bold")
    .style("font-size", "0.5em" )
    .attr "fill", triangle_color

  #Append triangles to group
  g.append('path')
    .attr("d", () ->
        # middle = (y(barHeight) - barVerticalSpacing)/2
        "M #{x_val} #{y_val} l #{height} 0 l -#{height/2} #{height} z"
      )
    .attr "fill", triangle_color

  ###
  triangle = d3.select('#bar_global_lifetime').select('path')
  text = d3.select('#bar_global_lifetime').select('text')

  triangle.transition().duration(700).attr("transform", "translate(110,0)" );
  text.transition().duration(700).attr("transform", "translate(110,0)" );

  Mieux :
    g.transition().duration(700).attr("transform", "translate(105,0)" );
  ###
