Template.itemBlockMedium.helpers
  isAllowedToEditItem: ->
    if @action_type is "generic"
      if (Meteor.user().roles.indexOf('admin') >= 0) is true
        return true
    else
      return true
  isActionListTplt: -> Router.current().route.getName() is 'actions-list'
  isScenarioListTplt: -> Router.current().route.getName() is 'scenarioList'
  whichCollection: ->
    if Router.current().route.getName() is 'actions-list'
      return "Actions"
    else if Router.current().route.getName() is 'scenarioList'
      return "Scenarios"
