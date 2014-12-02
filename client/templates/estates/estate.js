Template.estate.helpers(
    {
        estates: function(){
			return Estates.find({},
                        {sort: {estate_name:1}}
                        ).fetch();
		},
		name: function(estate){
			return estate.name;
		},

		upestate: function(){

			return "console.log('"+JSON.stringify(this)+"')";
		}
    }
);

Template.estate.events({
	'click .upestate': function(){
            // Session.set('current_estate_id', id);
            console.log('this is: ',this);
        }
});

/*Template.estate.helpers(
	{
		estates: function(){
			return Estates.find({},
                        {sort: {estate_name:1}}
                        ).fetch();
		},
		'click #new_estate': function(){

		},
		name: function(estate){
			return estate.name;
		}
	}
);
*/

// Template.estate.events({
//   // 'submit': function(event, template) {
//     'click #estateForm': function(id) {
//         event.preventDefault();
//         console.log('_id is: ' + this._id);
//         Session.set('current_estate_id', this._id)
//   }
// });

// $('#estateForm').on('show.bs.modal', function (event) {
//   // var button = $(event.relatedTarget) // Button that triggered the modal
//   var recipient = $(event.relatedTarget).data('estId') // Extract info from data-* attributes
//   // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
//   // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
//   var modal = $(this)
//   // modal.find('.modal-title').text('New message to ' + recipient)
//   // modal.find('.modal-body input').val(recipient)
//   getEstate(this._id);
//   console.log("totoooo");
// })

// Template.postItem.helpers({
//   domain: function() {
//     var a = document.createElement('a');
//     a.href = this.url;
//     return a.hostname;
//   }
// });
