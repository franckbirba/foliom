// Messages = new Meteor.Collection('messages');

Template.buildingDetail.rendered = function () {

    $('#messages').scrollTop($('#messages').prop("scrollHeight"));

    Messages.find().observe({
          added: function (newDocument, oldDocument) {
            // $("#messages").animate({ scrollTop: $('#messages').height()}, 1000);
            // console.log("hi!");
            $('#messages').scrollTop($('#messages').prop("scrollHeight"));
          }
        });

}

Template.buildingDetail.helpers({
    messages: function() {
        //$('#messages').scrollTop($('#messages').prop("scrollHeight"));
        return Messages.find({}, { sort: { time: 1}}).fetch();
    }
})

Template.buildingDetail.helpers({
    prettifyDate: function(timestamp) {
        //var tmp_date = new Date(timestamp).toString('yyyy-MM-dd'));
        return timeSince(timestamp);
    }
});

Template.input.events = {
  'keydown input#message' : function (event) {
    if (event.which == 13) { // 13 is the enter key event
      if (Meteor.user())
        var name = Meteor.user().profile.firstName + " - " + Meteor.user().profile.lastName;
      else
        var name = 'Anonymous';
      var message = document.getElementById('message');

      if (message.value != '') {
        Messages.insert({
          name: name,
          message: message.value,
          time: Date.now(),
        });

        // $("#messages").animate({
        //     scrollTop: $("#messages").scrollHeight()
        //     }, 300);

        // $("#messages").animate({ scrollTop: $('#messages')[0].scrollHeight}, 1000);

        document.getElementById('message').value = '';
        message.value = '';
      }
    }
  }
}
