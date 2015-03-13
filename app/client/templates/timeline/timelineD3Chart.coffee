# Local alias on the namespaced variables for the Timeline
TV = TimelineVars

###*
 * Chart's functions
###
ChartFct =
  ###*
   * Calculate and present data suite for the Water consumption chart.
  ###
  waterConsumptionChart: ->
    rxPlannedActions = TV.rxPlannedActions.get()
    quarters: TV.charts.ticks
    unit: TAPi18n.__ 'u_m3'
    chartName: TAPi18n.__ 'consumption_label'
    series: [
      {
        name: TAPi18n.__ 'consumption_noaction_water'
        style: 'noaction blue'
        data: TV.charts.consumption.water
      }
      {
        name: TAPi18n.__ 'consumption_action_water'
        style: 'action blue'
        data: TV.charts.consumption.water
      }
    ]
  ###*
   * Calculate and present data suite for the CO2 consumption chart.
  ###
  co2ConsumptionChart: ->
    rxPlannedActions = TV.rxPlannedActions.get()
    quarters: TV.charts.ticks
    unit: TAPi18n.__ 'u_kg_eqC02_m2_year'
    chartName: TAPi18n.__ 'consumption_label'
    series: [
      {
        name: TAPi18n.__ 'consumption_noaction_co2'
        style: 'noaction darkgray'
        data: TV.charts.consumption.co2
      }
      # {
      #   name: TAPi18n.__ 'consumption_action_co2'
      #   style: 'action darkgray'
      #   data: sum2Suites TV.charts.consumption.kwh, \
      #     sumSuiteFromArray rxPlannedActions, 'consumptionCo2ModifierSuite'
      # }
    ]
  ###*
   * Calculate and present data suite for the kWh consumption chart.
  ###
  kwhConsumptionChart: ->
    rxPlannedActions = TV.rxPlannedActions.get()
    quarters: TV.charts.ticks
    unit: TAPi18n.__ 'u_kwhEF'
    chartName: TAPi18n.__ 'consumption_label'
    series: [
      {
        name: TAPi18n.__ 'consumption_noaction_kwh'
        style: 'noaction orange'
        data: TV.charts.consumption.kwh
      }
      # {
      #   name: TAPi18n.__ 'consumption_action_kwh'
      #   data: sum2Suites TV.charts.consumption.kwh, \
      #     sumSuiteFromArray rxPlannedActions, 'consumptionKwhModifierSuite'
      # }
    ]
  ###*
   * Calculate and present data suite for the Expense chart.
  ###
  expenseChart: ->
    quarters: TV.charts.ticks
    unit: TAPi18n.__ 'u_euro'
    chartName: TAPi18n.__ 'expense_label'
    series: [
      {
        name: (TAPi18n.__ 'expense_noaction_water')
        style: 'noaction blue'
        data: TV.charts.expense.water
      }
      {
        name: (TAPi18n.__ 'expense_noaction_electricity')
        style: 'noaction violet'
        data: TV.charts.expense.electricity
      }
      {
        name: (TAPi18n.__ 'expense_noaction_frost')
        style: 'noaction darkgray'
        data: TV.charts.expense.frost
      }
      {
        name: (TAPi18n.__ 'expense_noaction_heat')
        style: 'noaction red'
        data: TV.charts.expense.heat
      }
    ]

  ###*
   * Calculate and present data suite for the Investment chart.
  ###
  investmentChart: ->
    rxPlannedActions = TV.rxPlannedActions.get()
    quarters: TV.charts.ticks
    unit: TAPi18n.__ 'u_euro'
    chartName: TAPi18n.__ 'investment_label'
    series: [
      {
        name: TAPi18n.__ 'investment_budget'
        style: 'action green'
        data: TV.charts.budget
      }
      {
        name: TAPi18n.__ 'investment_raw'
        style: 'action darkgray'
        data: sumSuiteFromArray rxPlannedActions, 'investmentSuite'
      }
      {
        name: TAPi18n.__ 'investment_minus_subventions'
        style: 'action gray'
        data: sumSuiteFromArray rxPlannedActions, 'investmentSubventionedSuite'
      }
    ]

###*
 * Set the template rendered callback.
###
Template.timelineD3Chart.rendered = ->
  # @TODO Check if 'this' enforcement is required
  chartFct = ChartFct[@data.chartName]
  chart = new D3LineChart "[data-chart='#{@data.chartName}']"
  chart.setData chartFct()
  # Update chart when reactive variables change
  # NOTE: We use the computation on the Template.Tracker for avoiding
  # the first call to the chart's update.
  @autorun (computation) ->
    rxPlannedActions = TV.rxPlannedActions.get()
    chart.updateData chartFct() unless computation.firstRun

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
