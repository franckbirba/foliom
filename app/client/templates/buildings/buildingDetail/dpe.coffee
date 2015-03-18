Template.dpe.rendered = ->
  # Current selected building is set as 'this'
  buildingId = @data._id

  this.autorun =>
    graphBuilder "dpe", Template.currentData().dpe_data #Reactive Data source (@data is not reactive)

