# Local alias on the namespaced variables for the Timeline
TV = TimelineVars

setSeries = (pactions, fluidType, color) ->
  firstUpperCase = fluidType.substr(0, 1).toUpperCase() + fluidType.substr(1)
  for act in [true, false]
    name: TAPi18n.__ \
      "consumption_#{unless act then 'no' else ''}action_#{fluidType}"
    style: "#{unless act then 'no' else ''}action #{color}"
    data: if act then TV.charts.consumption[fluidType] else \
      sum2Suites TV.charts.consumption[fluidType],
        sumSuiteFromArray pactions, "consumption#{firstUpperCase}"

###*
 * Chart's functions
###
ChartFct =
  ###*
   * Calculate and present data suite for the Water consumption chart.
  ###
  waterConsumptionChart: ->
    pactions = TV.rxPlannedActions.get()
    quarters: TV.charts.ticks
    unit: TAPi18n.__ 'u_m3'
    chartName: TAPi18n.__ 'consumption_label'
    series: setSeries pactions, 'water', 'blue'
  ###*
   * Calculate and present data suite for the CO2 consumption chart.
  ###
  co2ConsumptionChart: ->
    pactions = TV.rxPlannedActions.get()
    quarters: TV.charts.ticks
    unit: TAPi18n.__ 'u_kg_eqC02_m2_year'
    chartName: TAPi18n.__ 'consumption_label'
    series: setSeries pactions, 'co2', 'darkgray'
  ###*
   * Calculate and present data suite for the kWh consumption chart.
  ###
  kwhConsumptionChart: ->
    pactions = TV.rxPlannedActions.get()
    quarters: TV.charts.ticks
    unit: TAPi18n.__ 'u_kwhEF'
    chartName: TAPi18n.__ 'consumption_label'
    series: setSeries pactions, 'kwh', 'orange'
  ###*
   * Calculate and present data suite for the Expense chart.
  ###
  invoiceChart: ->
    pactions = TV.rxPlannedActions.get()
    quarters: TV.charts.ticks
    unit: TAPi18n.__ 'u_euro'
    chartName: TAPi18n.__ 'invoice_label'
    series: [
      {
        name: (TAPi18n.__ 'invoice_noaction_water')
        style: 'noaction blue'
        data: TV.charts.invoice.water
      }
      {
        name: (TAPi18n.__ 'invoice_action_water')
        style: 'action blue'
        data: sum2Suites TV.charts.invoice.water, \
          sumSuiteFromArray pactions, 'invoiceWater'
      }
      {
        name: (TAPi18n.__ 'invoice_noaction_electricity')
        style: 'noaction violet'
        data: TV.charts.invoice.electricity
      }
      {
        name: (TAPi18n.__ 'invoice_action_electricity')
        style: 'action violet'
        data: sum2Suites TV.charts.invoice.electricity, \
          sumSuiteFromArray pactions, 'invoiceElectricity'
      }
      {
        name: (TAPi18n.__ 'invoice_noaction_frost')
        style: 'noaction darkgray'
        data: TV.charts.invoice.frost
      }
      {
        name: (TAPi18n.__ 'invoice_action_frost')
        style: 'action darkgray'
        data: sum2Suites TV.charts.invoice.frost, \
          sumSuiteFromArray pactions, 'invoiceFrost'
      }
      {
        name: (TAPi18n.__ 'invoice_noaction_heat')
        style: 'noaction red'
        data: TV.charts.invoice.heat
      }
      {
        name: (TAPi18n.__ 'invoice_action_heat')
        style: 'action red'
        data: sum2Suites TV.charts.invoice.heat, \
          sumSuiteFromArray pactions, 'invoiceHeat'
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
        data: sumSuiteFromArray rxPlannedActions, 'investment'
      }
      {
        name: TAPi18n.__ 'investment_minus_subventions'
        style: 'action gray'
        data: sumSuiteFromArray rxPlannedActions, 'investmentSubventioned'
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
