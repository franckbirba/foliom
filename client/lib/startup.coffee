Meteor.startup ->
  ###
  @TODO Not ready for prime time: too much implication, need a revamp on href
  _enterAnimation = 'fadeIn animated'
  _leaveAnimation = 'fadeOut animated'
  _animate = ($el, anim, next) ->
    $el.addClass(anim).on ANIMATION_END_EVENT, ->
      $(this).removeClass anim
      next and next()

  Router.onAfterAction ->
    _animate $('page'), _enterAnimation

  $(document.body).click (e) ->
    $t = $(e.target).parents().andSelf().filter("[href]:last")
    url = undefined
    if $t.size() and (url = $t.attr('href'))
      currentRoute = Router.current()
      _animate $('.view-main'), _leaveAnimation, ->
        currentRoute.redirect url
      event.preventDefault()
      event.stopPropagation()
  ###
