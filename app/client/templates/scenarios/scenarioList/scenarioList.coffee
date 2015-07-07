Template.scenarioList.helpers
  getScenarios: ->
    Scenarios.find() if Session.get 'current_estate_doc'

Template.scenarioList.events
  'click .newScenario': (e) ->
    e.preventDefault()
    Session.set 'current_scenario_doc', null
    Router.go 'scenario-form'

  'click .scenarioItem': (e) ->
    Router.go 'scenario-form', this

  'click .dropdownBtn': (e) ->
    e.stopPropagation(); # Prevent propagation
    $('#'+ this._id).dropdown('toggle')

  'click .copyItem': (e) ->
    e.preventDefault()
    doc = clone @
    delete doc._id
    doc.name = "#{doc.name} - clone"
    Scenarios.insert(doc)
    $('#'+ this._id).dropdown('toggle')
