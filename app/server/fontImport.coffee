exports = this

exports.fontImport = (json, selector_name)->
  #get all pictos from the font
  foliomPictoSelection = Assets.getText(json);
  foliomPictoSelectionJson = EJSON.parse(foliomPictoSelection);

  actionLogo = _.map foliomPictoSelectionJson.icons, (item) ->
    return "&##{item.properties.code};"

  console.log "Checking font: #{selector_name}"

  logoObject =
    name: selector_name
    labels: actionLogo

  Selectors.upsert({name: selector_name}, {$set: logoObject})

# Example
# var foliomPictoSelection = Assets.getText('foliom-picto-selection.json');
#     var foliomPictoSelectionJson = EJSON.parse(foliomPictoSelection);

#     var actionLogo = _.map(foliomPictoSelectionJson.icons, function(item){
#       return "&#" + item.properties.code + ";" ;
#     });

#     var actionLogoObject = {
#                       name: 'action_logo',
#                       labels: actionLogo
#                   };
#     Selectors.upsert({name: 'action_logo'}, {$set: actionLogoObject});
