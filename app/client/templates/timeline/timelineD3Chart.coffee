###*
 * Responsive D3 charts for lines
###
class D3LineChart
  ###*
   * C-tor
   * @param  {String} @svgContainer DOM container with a .d3-svg-container
   * @param  {Object} @margin       Margins as an Object of Number
   *                                with top, right, bottom, left keys,
   *                                default to { top: 10, right: 30,
   *                                bottom: 20, left: 30 }
   * @param  {Number} @svgWidth     Width of the SVG, default to 490
   * @param  {Number} @svgHeight    Heigh of the SVG, default to 195
  ###
  constructor: (
    @svgContainer,
    @margin = { top: 10, right: 5, bottom: 20, left: 30 },
    @svgWidth = 750,
    @svgHeight = 195
  ) ->
    # Graph's width
    @graphWidth = @svgWidth - @margin.left - @margin.right
    # Graph's height
    @graphHeight = @svgHeight - @margin.top - @margin.bottom
    # Abscissa and Ordonna
    @x = @y = {}
    # Add an SVG element with the desired dimensions and margin.
    @graph = d3.select @svgContainer
      .append 'svg:svg'
      # Make SVG responsive
      .attr 'preserveAspectRatio', 'xMinYMin meet'
      .attr 'viewBox', "0 0 #{@svgWidth} #{@svgHeight}"
      .attr 'class', 'd3-svg-content'
      # Group chart's components
      .append 'svg:g'
      .attr 'transform',
        "translate(#{@margin.left}, #{@margin.top})"
  ###*
   * Set the abscissa for each lines.
   * @param {Array} arr An array of Number.
  ###
  setAbscissa: (arr) ->
    @xScalingFct = d3.scale.linear()
      .domain [0, arr.length]
      .range [0, @graphWidth]
    # Create xAxis
    xAxis = d3.svg.axis()
      .scale @xScalingFct
      .tickSize -@graphHeight
    # Add the xAxis
    @graph.append 'svg:g'
      .attr 'class', 'x axis'
      .attr 'transform', "translate(0, #{@graphHeight})"
      .call xAxis
  ###*
   * Set data for each lines.
   * @param {Object} dataObj [description]
  ###
  setData: (dataObj) ->
    # Only display yAxis on the first data set
    if dataObj.id is 0
      @yScalingFct = d3.scale.linear()
        .domain [(d3.max dataObj.value), 0]
        .range [0, @graphHeight]
      # Create yAxis
      yAxis = d3.svg.axis()
        .scale @yScalingFct
        .tickSize 4
        .orient 'left'
      # Add the yAxis
      @graph.append 'svg:g'
        .attr 'class', 'y axis'
        .call yAxis
    # Set the line properties
    @y[dataObj.id] =
      value: dataObj.value
      line: d3.svg.line()
        .x (d, i) =>
          # Return the X coordinate where we want to plot this datapoint
          @xScalingFct i
        .y (d) =>
          # Return the Y coordinate where we want to plot this datapoint
          @yScalingFct d
    # Add lines after axis and tick lines have been drawn
    @graph.append 'svg:path'
      .attr 'd', @y[dataObj.id].line @y[dataObj.id].value
      .attr 'class', "data#{dataObj.id}"

Template.timelineD3Chart.rendered = ->
  data0 = [3, 6, 2, 7, 5]
  data1 = [3, 4, 2, 2, 1]
  chart = new D3LineChart "[data-chart='#{@data.chartName}']"
  chart.setAbscissa data0
  chart.setData id: 0, value: data0
  chart.setData id: 1, value: data1
