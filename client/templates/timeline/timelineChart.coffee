CHARTIST_PROPERTIES =
  low: 0
  lineSmooth: false
  showPoint: true
  axisX: showLabel: false, showGrid: false

###*
 * Calculate and present data suite for the Consumption chart.
###
TimelineVars.getConsumptionChartData = ->
  labels: TimelineVars.charts.ticks
  series: [
    {
      name: TAPi18n.__ 'consumption_noaction'
      data: TimelineVars.charts.consumption
    }
    {
      name: TAPi18n.__ 'consumption_action_co2'
      data: sum2Suites TimelineVars.charts.consumption, \
        sumSuiteFromArray TimelineVars.actions, 'consumptionCo2ModifierSuite'
    }
    {
      name: TAPi18n.__ 'consumption_action_kwh'
      data: sum2Suites TimelineVars.charts.consumption, \
        sumSuiteFromArray TimelineVars.actions, 'consumptionKwhModifierSuite'
    }
  ]

###*
 * Calculate and present data suite for the Expense chart.
###
TimelineVars.getExpenseChartData = ->
  labels: TimelineVars.charts.ticks
  series: [
    {
      name: TAPi18n.__ 'expense_raw'
      data: TimelineVars.charts.consumption
    }
  ]

###*
 * Calculate and present data suite for the Investment chart.
###
TimelineVars.getInvestmentChartData = ->
  labels: TimelineVars.charts.ticks
  series: [
    {
      name: TAPi18n.__ 'investment_budget'
      data: TimelineVars.charts.budget
    }
    {
      name: TAPi18n.__ 'investment_raw'
      data: sumSuiteFromArray TimelineVars.actions, 'investmentSuite'
    }
    {
      name: TAPi18n.__ 'investment_minus_subventions'
      data: sumSuiteFromArray TimelineVars.actions,'investmentSubventionedSuite'
    }
  ]

###*
 * Ends rendering actions when template is rendered.
###
Template.timelineChart.rendered = ->
  # Create SVG charts with Chartist and attach them to the DOM
  tv = window.TimelineVars
  tv.consumptionChart = new Chartist.Line \
    '[data-chart=\'consumptionChart\']'
  , tv.getConsumptionChartData()
  , CHARTIST_PROPERTIES
  tv.expenseChart = new Chartist.Line \
    '[data-chart=\'expenseChart\']'
  , tv.getExpenseChartData()
  , CHARTIST_PROPERTIES
  tv.investmentChart = new Chartist.Line \
    '[data-chart=\'investmentChart\']'
  , tv.getInvestmentChartData()
  , CHARTIST_PROPERTIES
  # Add tooltips to the charts
  addToolTip @data.chartName

###*
 * Object containing event actions for the template.
###
Template.timelineChart.events
  # Click on a hide/show legend
  'click [data-trigger=\'hideshow-legend\']': (e, t) ->
    button = t.$ e.target
    chartValue = button.attr 'data-value'
    widget = t.$ "[data-role='#{chartValue}']"
    chart = widget.find '[data-role=\'chart\']'
    legend = widget.find '[data-role=\'legend\']'
    if button.hasClass 'glyphicon-eye-close'
      legend.hide()
    else
      legend.show()
    (chart.toggleClass 'col-md-8').toggleClass 'col-md-11'
    (chart.children().toggleClass 'ct-octave').toggleClass 'ct-double-octave'
    TimelineVars[chartValue].update()
    (button.toggleClass 'glyphicon-eye-close').toggleClass 'glyphicon-eye-open'

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

###*
 * Animation function for the tooltips as depicted in Chartist's docs:
 * http://gionkunz.github.io/chartist-js/examples.html
 * @param {Number} x X axis
 * @param {Number} t Time
 * @param {Number} b First order
 * @param {Number} c Second order
 * @param {Number} d Third order
###
easeOutQuad = (x, t, b, c, d) -> -c * (t /= d) * (t - 2) + b

###*
 * Add a tooltip for a given chart.
 * @param {String} dataChart Value of the data-chart selector.
###
addToolTip = (dataChart) ->
  $chart = $ "[data-chart='#{dataChart}']"
  TimelineVars.toolTips[dataChart] = $chart
    .append '<div class="tooltip"></div>'
    .find '.tooltip'
    .hide()
  $chart.on 'mouseenter', '.ct-point', ->
    $point = $ @
    value = $point.attr 'ct:value'
    seriesName = $point.parent().attr 'ct:series-name'
    $point.animate {'stroke-width': '20px'}, 100, easeOutQuad
    (TimelineVars.toolTips[dataChart].html "#{seriesName}<br>#{value}").show()
  $chart.on 'mouseleave', '.ct-point', ->
    ($ @).animate {'stroke-width': '4px'}, 100, easeOutQuad
    TimelineVars.toolTips[dataChart].hide()
  $chart.on 'mousemove', (e) ->
    TimelineVars.toolTips[dataChart].css
      left: (e.offsetX or e.originalEvent.layerX) - \
        TimelineVars.toolTips[dataChart].width() / 2 - 10
      top: (e.offsetY or e.originalEvent.layerY) - \
        TimelineVars.toolTips[dataChart].height() - 40
