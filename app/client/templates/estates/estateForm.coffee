Template.estateForm.helpers
  users: ->
    labelList2 = []
    Meteor.users.find().forEach (user) ->
      # console.log(user.profile.username);
      name = user.profile.firstName + ' ' + user.profile.lastName
      labelList2.push
        label: name
        value: user._id
      return
    labelList2
  getEstate: ->
    if Session.get('update_estate_var')
      console.log Session.get('update_estate_doc')
      Session.get 'update_estate_doc'
    else
      ''
  getFormType: ->
    if Session.get('update_estate_var')
      'update'
    else
      'insert'

AutoForm.addHooks null,
  onError: ->
    console.log arguments

AutoForm.hooks
  AFestateForm:
    onSuccess: (formType, result) ->
      Session.set 'current_estate_doc', Estates.findOne(@docId)
      if formType == 'insert'
        $('#estateForm').modal 'hide'
        Meteor.call 'copyMasterCfg', result, (error, result) ->
          if error
            console.log error
          return
      else if formType == 'update'
        $('#estateForm').modal 'hide'
      return
