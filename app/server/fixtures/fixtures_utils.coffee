allQualitativeValues=
  comfort_qualitative_assessment:
    1: 'good'
    2: 'average'
    3: 'bad'
  technical_compliance_lifetime:
    1: 'new_dvr'
    2: 'average_dvr'
    3: 'bad_dvr'
  technical_compliance_conformity:
    1: 'compliant'
    2: 'not_compliant_minor'
    3: 'not_compliant_major'

# Random DVR
@randomQualitativeValue = (type) ->
  randomInt = randomIntFromInterval(1,3)
  return allQualitativeValues[type][randomInt]

# Random Technical field
@randomTechnicalField = () ->
  randomInt = randomIntFromInterval(0, technical_compliance_items.length-1)
  return technical_compliance_items[randomInt]

# Return a random number of technical (in an array)
@randomTechnicalFieldArray = (maxTechFields) ->
  randomInt = randomIntFromInterval(1, maxTechFields)
  i = 0
  result = []
  while i<randomInt
    result.push randomTechnicalField()
    i++
  return result
