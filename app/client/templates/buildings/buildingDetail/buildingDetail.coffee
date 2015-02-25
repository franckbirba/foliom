

Template.buildingDetail.events
  'change #leaseSelect': (event) ->
    if event.target.value is 'all_leases'
      Session.set 'current_lease_id', null
    else
      Session.set 'current_lease_id', event.target.value

  'click .update_lease': (e) ->
    e.preventDefault()
    Session.set 'leaseToEdit', this # "this" is passed by Meteor - it's the current item
    Router.go 'leaseForm'

