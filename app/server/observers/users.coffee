root = exports ? this

# Make the user profile accessible server-side
# We only need the profile at the moment
Accounts.onLogin((obj)->
  root.current_user = {}
  root.current_user['profile'] = obj.user.profile
)
