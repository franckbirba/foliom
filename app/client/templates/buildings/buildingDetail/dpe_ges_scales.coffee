@parseDpeGesScale = (dpe_or_ges, dpe_type, dpeValue) ->
  console.log "in parseDpeGesScale"
  console.log "dpe_type is #{dpe_type}"

  pattern1 = /// #Looking for a string which looks like "51 - 90"
    (\d+) #First number
    \s-\s # the - (in between 2 spaces)
    (\d+) #Second number
  ///

  var1 = "51 - 90".match(pattern1)[1..3]
  # var2 = "≤ 50".match(pattern1)[1..3]
  var2 = "≤ 50".match(pattern1)
  console.log "test is #{var1}"
  console.log "test is #{var2}"

  for item in dpe_scale[dpe_type][dpe_or_ges] #In the dpe_scale, get the type, then the dpe or ges scale.
    # Now we go through all the values
    # console.log item.label.match(pattern1)
    if item.label.match(pattern1)?.length > 0 #only keep cases when there's a match
      matchArray = item.label.match(pattern1)[1..3]
      # console.log dpeValue
      # console.log Number(matchArray[0])
      # console.log Number(matchArray[1])
      # console.log "dpeValue: #{dpeValue} - matchArray[0]: #{matchArray[0]} - matchArray[1]: #{matchArray[1]}"
      if Number(matchArray[0]) <= dpeValue <= Number(matchArray[1])
        console.log "letter is #{item.letter}"
    else console.log "null :("


@dpe_scale =
  housing:
    dpe: [
      { "label": "≤ 50", "letter": "A", "color" : "#555753", "textColor":"white", "value": 30 },
      { "label": "51 - 90", "letter": "B", "color" : "#888a85", "textColor":"black", "value": 40 },
      { "label": "91 - 150", "letter": "C", "color" : "#babdb6", "textColor":"black", "value": 50 },
      { "label": "151 - 230", "letter": "D", "color" : "#d3d7cf", "textColor":"black", "value": 60 },
      { "label": "231 - 330", "letter": "E", "color" : "#babdb6", "textColor":"black", "value": 70 },
      { "label": "331 - 450", "letter": "F", "color" : "#888a85", "textColor":"black", "value": 80 },
      { "label": "> 450", "letter": "G", "color" : "#555753", "textColor":"white", "value": 90 }
    ]
    ges: [
      { "label": "≤ 5", "letter": "A", "color" : "#ccc", "textColor":"white", "value": 30 },
      { "label": "6 - 10", "letter": "B", "color" : "#b3b3b3", "textColor":"black", "value": 40 },
      { "label": "11 - 20", "letter": "C", "color" : "#999", "textColor":"black", "value": 50 },
      { "label": "21 - 35", "letter": "D", "color" : "#808080", "textColor":"black", "value": 60 },
      { "label": "36 - 55", "letter": "E", "color" : "#666", "textColor":"black", "value": 70 },
      { "label": "56 - 80", "letter": "F", "color" : "#4d4d4d", "textColor":"black", "value": 80 },
      { "label": "> 80", "letter": "G", "color" : "#333", "textColor":"white", "value": 90 }
    ]
  tertiary_building_private:
    dpe: [
      { "label": "≤ 50", "letter": "A", "color" : "#555753", "textColor":"white", "value": 30 },
      { "label": "51 - 90", "letter": "B", "color" : "#888a85", "textColor":"black", "value": 40 },
      { "label": "91 - 150", "letter": "C", "color" : "#babdb6", "textColor":"black", "value": 50 },
      { "label": "151 - 230", "letter": "D", "color" : "#d3d7cf", "textColor":"black", "value": 60 },
      { "label": "231 - 330", "letter": "E", "color" : "#babdb6", "textColor":"black", "value": 70 },
      { "label": "331 - 450", "letter": "F", "color" : "#888a85", "textColor":"black", "value": 80 },
      { "label": "451 - 590", "letter": "G", "color" : "#555753", "textColor":"white", "value": 90 },
      { "label": "591 - 750", "letter": "H", "color" : "#4d4d4d", "textColor":"white", "value": 100 },
      { "label": "≥ 750", "letter": "I", "color" : "#333", "textColor":"white", "value": 110 }
    ]
    ges: [
      { "label": "≤ 5", "letter": "A", "color" : "#ccc", "textColor":"white", "value": 30 },
      { "label": "6 - 10", "letter": "B", "color" : "#b3b3b3", "textColor":"black", "value": 40 },
      { "label": "11 - 20", "letter": "C", "color" : "#999", "textColor":"black", "value": 50 },
      { "label": "21 - 35", "letter": "D", "color" : "#808080", "textColor":"black", "value": 60 },
      { "label": "36 - 55", "letter": "E", "color" : "#666", "textColor":"black", "value": 70 },
      { "label": "56 - 80", "letter": "F", "color" : "#4d4d4d", "textColor":"black", "value": 80 },
      { "label": "81 - 110", "letter": "G", "color" : "#404040", "textColor":"white", "value": 90 },
      { "label": "111 - 145", "letter": "H", "color" : "#3B3B3B", "textColor":"white", "value": 100 },
      { "label": "> 145", "letter": "I", "color" : "#333", "textColor":"white", "value": 110 }
    ]
  tertiary_building_public_std:
    dpe: [
      { "label": "≤ 50", "letter": "A", "color" : "#555753", "textColor":"white", "value": 30 },
      { "label": "51 - 110", "letter": "B", "color" : "#888a85", "textColor":"black", "value": 40 },
      { "label": "111 - 210", "letter": "C", "color" : "#babdb6", "textColor":"black", "value": 50 },
      { "label": "211 - 350", "letter": "D", "color" : "#d3d7cf", "textColor":"black", "value": 60 },
      { "label": "351 - 540", "letter": "E", "color" : "#babdb6", "textColor":"black", "value": 70 },
      { "label": "541 - 750", "letter": "F", "color" : "#888a85", "textColor":"black", "value": 80 },
      { "label": "> 750", "letter": "G", "color" : "#555753", "textColor":"white", "value": 90 },
    ]
    ges: [
      { "label": "≤ 5", "letter": "A", "color" : "#ccc", "textColor":"white", "value": 30 },
      { "label": "6 - 15", "letter": "B", "color" : "#b3b3b3", "textColor":"black", "value": 40 },
      { "label": "16 - 30", "letter": "C", "color" : "#999", "textColor":"black", "value": 50 },
      { "label": "31 - 60", "letter": "D", "color" : "#808080", "textColor":"black", "value": 60 },
      { "label": "61 - 100", "letter": "E", "color" : "#666", "textColor":"black", "value": 70 },
      { "label": "101 - 145", "letter": "F", "color" : "#4d4d4d", "textColor":"black", "value": 80 },
      { "label": "> 145", "letter": "G", "color" : "#333", "textColor":"white", "value": 90 }
    ]
  tertiary_building_public_continuously_occ:
    dpe: [
      { "label": "≤ 100", "letter": "A", "color" : "#555753", "textColor":"white", "value": 30 },
      { "label": "101 - 210", "letter": "B", "color" : "#888a85", "textColor":"black", "value": 40 },
      { "label": "211 - 370", "letter": "C", "color" : "#babdb6", "textColor":"black", "value": 50 },
      { "label": "371 - 580", "letter": "D", "color" : "#d3d7cf", "textColor":"black", "value": 60 },
      { "label": "581 - 830", "letter": "E", "color" : "#babdb6", "textColor":"black", "value": 70 },
      { "label": "831 - 1130", "letter": "F", "color" : "#888a85", "textColor":"black", "value": 80 },
      { "label": "> 1130", "letter": "G", "color" : "#555753", "textColor":"white", "value": 90 },
    ]
    ges: [
      { "label": "≤ 12", "letter": "A", "color" : "#ccc", "textColor":"white", "value": 30 },
      { "label": "13 - 30", "letter": "B", "color" : "#b3b3b3", "textColor":"black", "value": 40 },
      { "label": "31 - 65", "letter": "C", "color" : "#999", "textColor":"black", "value": 50 },
      { "label": "66 - 110", "letter": "D", "color" : "#808080", "textColor":"black", "value": 60 },
      { "label": "111 - 160", "letter": "E", "color" : "#666", "textColor":"black", "value": 70 },
      { "label": "161 - 220", "letter": "F", "color" : "#4d4d4d", "textColor":"black", "value": 80 },
      { "label": "> 220", "letter": "G", "color" : "#333", "textColor":"white", "value": 90 }
    ]
  tertiary_building_public_other_types:
    dpe: [
      { "label": "≤ 30", "letter": "A", "color" : "#555753", "textColor":"white", "value": 30 },
      { "label": "31 - 90", "letter": "B", "color" : "#888a85", "textColor":"black", "value": 40 },
      { "label": "91 - 170", "letter": "C", "color" : "#babdb6", "textColor":"black", "value": 50 },
      { "label": "171 - 270", "letter": "D", "color" : "#d3d7cf", "textColor":"black", "value": 60 },
      { "label": "271 - 380", "letter": "E", "color" : "#babdb6", "textColor":"black", "value": 70 },
      { "label": "381 - 510", "letter": "F", "color" : "#888a85", "textColor":"black", "value": 80 },
      { "label": "> 510", "letter": "G", "color" : "#555753", "textColor":"white", "value": 90 },
    ]
    ges: [
      { "label": "≤ 3", "letter": "A", "color" : "#ccc", "textColor":"white", "value": 30 },
      { "label": "4 - 10", "letter": "B", "color" : "#b3b3b3", "textColor":"black", "value": 40 },
      { "label": "11 - 25", "letter": "C", "color" : "#999", "textColor":"black", "value": 50 },
      { "label": "26 - 45", "letter": "D", "color" : "#808080", "textColor":"black", "value": 60 },
      { "label": "46 - 70", "letter": "E", "color" : "#666", "textColor":"black", "value": 70 },
      { "label": "71 - 95", "letter": "F", "color" : "#4d4d4d", "textColor":"black", "value": 80 },
      { "label": "> 95", "letter": "G", "color" : "#333", "textColor":"white", "value": 90 }
    ]
