###*
 * Responsive D3 charts for lines
###
class D3LineChart
  ###*
   * C-tor
   * @param  {String} @svgContainer DOM container with a .d3-svg-container
   * @param  {Array}  @margins      Margins as an Array of Number
   *                                with [top, right, bottom, left],
   *                                default to [10, 30, 20, 30]
   * @param  {Number} @svgWidth     Width of the SVG, default to 490
   * @param  {Number} @svgHeight    Heigh of the SVG, default to 195
  ###
  constructor: (
    @svgContainer, @margins=[10, 30, 20, 30], @svgWidth=490, @svgHeight=195
  ) ->
    # Graph's width
    @graphWidth = @svgWidth - @margins[1] - @margins[1]
    # Graph's height
    @graphHeight = @svgHeight - @margins[0] - @margins[2]
    @data = {}
  ###*
   * Set data for each lines.
   * @param {Object} dataObj An object with an id as a Number and a value as an
   *                         Arrray of Number.
  ###
  setData: (dataObj) ->
    @data[dataObj.id] = dataObj.value



Template.timelineD3Chart.rendered = ->
  chart = new  D3LineChart "[data-chart='#{@data.chartName}']"
  chart.setData id: 0, value: [3, 6, 2, 7, 5]
  chart.setData id: 1, value: [543, 367, 215, 56, 65]

  # Define graph dimensions
  # Margins
  m = [10, 30, 20, 30]
  # Width
  w = 490 - m[1] - m[3]
  # Height
  h = 195 - m[0] - m[2]
  # Create a simple data array that we'll plot with a line (this array
  #  represents only the Y values, X will just be the index location)
  data1 = [3, 6, 2, 7, 5]
  data2 = [543, 367, 215, 56, 65]
  # X scale will fit all values from data[] within pixels 0-w
  x = d3.scale.linear()
    .domain [0, data1.length]
    .range [0, w]
  # Y scale will fit values from 0-10 within pixels h-0
  #  (Note the inverted domain for the y-scale: bigger is up!)
  y1 = d3.scale.linear()
    .domain [0, d3.max data1]
    .range [h, 0]
  # in real world the domain would be dynamically calculated from the data
  y2 = d3.scale.linear()
    .domain [0, d3.max data2]
    .range [h, 0]
  # in real world the domain would be dynamically calculated from the data
  # automatically determining max range can work something like this
  # var y = d3.scale.linear().domain([0, d3.max(data)]).range([h, 0]);
  # create a line function that can convert data[] into x and y points
  line1 = d3.svg.line()
    .x (d, i) ->
      # return the X coordinate where we want to plot this datapoint
      x i
    .y (d) ->
      # return the Y coordinate where we want to plot this datapoint
      y1 d
  # create a line function that can convert data[] into x and y points
  line2 = d3.svg.line()
    .x (d, i) ->
      # return the X coordinate where we want to plot this datapoint
      x i
    .y (d) ->
      # return the Y coordinate where we want to plot this datapoint
      y2 d
  # Add an SVG element with the desired dimensions and margin.
  graph = d3.select "[data-chart='#{@data.chartName}']"
    .append 'svg:svg'
    # Make SVG responsive
    .attr 'preserveAspectRatio', 'xMinYMin meet'
    .attr 'viewBox', "0 0 #{w + m[1] + m[3]} #{h + m[0] + m[2]}"
    .attr 'class', 'd3-svg-content'
    # Group chart's components
    .append 'svg:g'
    .attr 'transform', "translate(#{m[3]}, #{m[0]})"
  # create yAxis
  xAxis = d3.svg.axis()
    .scale x
    .tickSize -h
    .tickSubdivide true
  # Add the x-axis.
  graph.append 'svg:g'
    .attr 'class', 'x axis'
    .attr 'transform', "translate(0, #{h})"
    .call xAxis
  # create left yAxis
  yAxisLeft = d3.svg.axis()
    .scale y1
    .ticks 4
    .orient 'left'
  # Add the y-axis to the left
  graph.append 'svg:g'
    .attr 'class', 'y axis axisLeft'
    .attr 'transform', 'translate(-15,0)'
    .call yAxisLeft
  # create right yAxis
  yAxisRight = d3.svg.axis()
    .scale y2
    .ticks 6
    .orient 'right'
  # Add the y-axis to the right
  graph.append 'svg:g'
    .attr 'class', 'y axis axisRight'
    .attr 'transform', "translate(#{w + 15})"
    .call yAxisRight
  # Add lines
  # do this AFTER the axes above so that the line is above the tick-lines
  graph.append 'svg:path'
    .attr 'd', line1 data1
    .attr 'class', 'data1'
  graph.append 'svg:path'
    .attr 'd', line2 data2
    .attr 'class', 'data2'
