Circles = new Meteor.Collection('circles');

if (Meteor.isServer) {
  // Meteor.startup(function () {
  //   if (Circles.find().count() === 0) {
  //     Circles.insert({data: [5, 8, 11, 14, 17, 20]});
  //   }
  // });

  Meteor.setInterval(function () {
    var newData = _.shuffle(Circles.findOne().data);
    Circles.update({}, {data: newData});
  }, 2000);
}

Lists = new Meteor.Collection('lists');

// Calculate a default name for a list in the form of 'List A'
Lists.defaultName = function() {
  var nextLetter = 'A', nextName = 'List ' + nextLetter;
  while (Lists.findOne({name: nextName})) {
    // not going to be too smart here, can go past Z
    nextLetter = String.fromCharCode(nextLetter.charCodeAt(0) + 1);
    nextName = 'List ' + nextLetter;
  }

  return nextName;
};

Todos = new Meteor.Collection('todos');
