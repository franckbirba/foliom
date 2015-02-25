# Local alias on the namespaced variables for the Timeline
TV = TimelineVars

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
    @margin = { top: 10, right: 15, bottom: 20, left: 35 },
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
      .tickFormat (d, i) -> arr[d]
      .tickSize -@graphHeight
      .tickPadding 6
    # Add the xAxis
    @graph.append 'svg:g'
      .attr 'class', 'x axis'
      .attr 'transform', "translate(0, #{@graphHeight})"
      .call xAxis
  ###*
   * Set data for each lines.
   * @param {Object} obj An Object describing each chart.
  ###
  setData: (obj) ->
    @setAbscissa obj.labels
    for dataObj, idx in obj.series
      # Prevent hoisting by performing immediate actions
      do (name = dataObj.name, data = dataObj.data, idx = idx) =>
        # Only display yAxis on the first data set
        if idx is 0
          @yScalingFct = d3.scale.linear()
            .domain [(d3.max dataObj.data), 0]
            .range [0, @graphHeight]
          # Create yAxis
          yAxis = d3.svg.axis()
            .scale @yScalingFct
            .tickFormat (d, i) -> numeral(d).format('0.0a')
            .tickSize -@graphWidth
            .tickPadding 6
            .orient 'left'
          # Add the yAxis
          @graph.append 'svg:g'
            .attr 'class', 'y axis'
            .call yAxis
        # Set the line properties
        line = d3.svg.line()
          .x (d, i) =>
            # Return the X coordinate where we want to plot this datapoint
            @xScalingFct i
          .y (d) =>
            # Return the Y coordinate where we want to plot this datapoint
            @yScalingFct d
        # Add lines after axis and tick lines have been drawn
        lineGroup = @graph.append 'svg:g'
          .attr 'class', "data#{idx}"
        lineGroup.append 'svg:path'
            .attr 'class', "data#{idx}"
            .datum dataObj.data
            .attr 'd', line
        # Add circles and tips
        tip = d3.tip()
          .attr 'class', 'd3-tip'
          .offset [-2, 0]
          .html (d, i) =>
            "<strong>#{name}</strong><br>\
            <span>#{d}</span>"
        @graph.call tip
        lineGroup.selectAll 'circle'
          .data dataObj.data
          .enter()
          .append 'circle'
            .attr 'class', "data#{idx}"
            .attr 'r', 2
            .attr 'cx', (d, i) => @xScalingFct i
            .attr 'cy', (d) => @yScalingFct d
            .on 'mouseover', tip.show
            #.on 'mouseout', tip.hide

###*
 * Chart's functions
###
ChartFct =
  ###*
   * Calculate and present data suite for the Consumption chart.
  ###
  consumptionChart: ->
    rxPlannedActions = TV.rxPlannedActions.get()
    labels: TV.charts.ticks
    series: [
      {
        name: TAPi18n.__ 'consumption_noaction'
        data: TV.charts.consumption
      }
      {
        name: TAPi18n.__ 'consumption_action_co2'
        data: sum2Suites TV.charts.consumption, \
          sumSuiteFromArray rxPlannedActions, 'consumptionCo2ModifierSuite'
      }
      {
        name: TAPi18n.__ 'consumption_action_kwh'
        data: sum2Suites TV.charts.consumption, \
          sumSuiteFromArray rxPlannedActions, 'consumptionKwhModifierSuite'
      }
    ]

  ###*
   * Calculate and present data suite for the Expense chart.
  ###
  expenseChart: ->
    labels: TV.charts.ticks
    series: [
      {
        name: (TAPi18n.__ 'expense_raw')
        data: TV.charts.consumption
      }
    ]

  ###*
   * Calculate and present data suite for the Investment chart.
  ###
  investmentChart: ->
    rxPlannedActions = TV.rxPlannedActions.get()
    labels: TV.charts.ticks
    series: [
      {
        name: TAPi18n.__ 'investment_budget'
        data: TV.charts.budget
      }
      {
        name: TAPi18n.__ 'investment_raw'
        data: sumSuiteFromArray rxPlannedActions, 'investmentSuite'
      }
      {
        name: TAPi18n.__ 'investment_minus_subventions'
        data: sumSuiteFromArray rxPlannedActions, 'investmentSubventionedSuite'
      }
    ]

###*
 * Set the template rendered callback.
###
Template.timelineD3Chart.rendered = ->
  chartFct = ChartFct[@data.chartName]
  chart = new D3LineChart "[data-chart='#{@data.chartName}']"
  chart.setData chartFct()

###*
 * Create an Array of the provided size filled with 0.
 * @param {Number} size Size of the expected Array.
 * @return {Array} The created Array.
###
createArrayFilledWithZero = (size) ->
  (Array.apply null, new Array size).map Number.prototype.valueOf, 0

###*
 * Sum suites from an Array of Object with suites reachable with the same
 *  property key.
 * @param {Array} arr The Array of Object.
 * @param {String} key The property of the Object.
 * @result {Array} The suite as a sum of all the Array of Object suite.
###
sumSuiteFromArray = (arr, key) ->
  results = createArrayFilledWithZero arr[0][key].length
  for idx in [0...results.length]
    for item in arr
      results[idx] += item[key][idx]
  results

###*
 * Sum 2 suites of exact same length.
 * @param {Array} suite1 First suite. Its length is used as the reference.
 * @param {Array} suite2 Second suite.
 * @return {Array} The result of the sum.
###
sum2Suites = (suite1, suite2) ->
  results = createArrayFilledWithZero suite1.length
  for idx in [0...results.length]
    results[idx] = suite1[idx] + suite2[idx]
  results
