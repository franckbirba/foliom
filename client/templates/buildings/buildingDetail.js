// Get list of all Portfolios for current Estate, sorted by alpha (on name)
Template.buildingDetail.helpers({
    getLeases: function(){
        var result = Leases.find( { building_id: Session.get('current_building_doc')._id },
                    {sort: {name:1}}
                    ).fetch();

        return result;

        // only return smthg if Session.get('current_estate_doc') has a value
        // if (curr_est_doc !== undefined && curr_est_doc.hasOwnProperty("portfolio_collection") ) {
        //     console.log("I was here");
        //     var result = Portfolios.find({_id: {$in : curr_est_doc.portfolio_collection} },
        //             {sort: {name:1}}
        //             ).fetch();
        //     console.log(result);
        //     return result;
        // };
    }
});


Template.buildingDetail.events({
    'change #leaseSelect': function(event) {
        if (event.target.value == "all_leases") {
            Session.set("current_lease_id", null);
        } else {
            Session.set("current_lease_id", event.target.value);
        }
   }
});

Template.buildingDetail.rendered = function () {

    var dataHolder = [];
    var averagedData = {
        "text_domain": [],
        "data": []
    };
    var totalSurface = 0 ;

    var current_building_doc_id = Session.get('current_building_doc')._id
    lease = Leases.find({building_id:current_building_doc_id}).fetch();

    // Build the text domain and the Data
    _.each(lease, function(entry, i) {
        dataHolder[i] = {
            _id: entry._id
        };

        dataHolder[i].text_domain = entry.consumption_by_end_use.map(function(item){
            return item.end_use_name; // returns an array of the EndUse names
        });

        dataHolder[i].data = entry.consumption_by_end_use.map(function(item){
            return { label: item.end_use_name, value: item.first_year_value }
        });

        _.each(dataHolder[i].data, function(entry2, i) {
            // console.log("current entry is: ");
            // console.log(entry2);

            if ( _.where(averagedData.data, {label: entry2.label}).length == 0 ) { // in this case the label does not exist
                averagedData.text_domain.push( entry2.label );

                averagedData.data.push(
                    { label: entry2.label, value: entry2.value*entry.area_by_usage }
                );
            }
            else {
                _.each(averagedData.data, function(entry3, i) {
                    if (entry3.label == entry2.label) {
                        // console.log("was heeere - label is: "+ entry2.label);
                        // console.log("entry3.value is: " + entry3.value);
                        // console.log("entry2.value (dataHolder value) is: " + entry2.value);
                        // console.log("area of useage is: " + entry.area_by_usage);

                        entry3.value += entry2.value*entry.area_by_usage ;
                    }
                });
            }
        });

        totalSurface += entry.area_by_usage;

        // console.log("dataHolder: "+i);
        // console.log(JSON.stringify(dataHolder[i]) );
        // console.log("averagedData: ");
        // console.log(JSON.stringify(averagedData));

    });

    //And to finish: divide all data values by the Total surface
    _.each(averagedData.data, function(dataItem, i) {
        dataItem.value = (dataItem.value / totalSurface).toFixed(2) ;
    });

    Session.set('pieData', dataHolder);
    Session.set('averagedPieData', averagedData);
};
