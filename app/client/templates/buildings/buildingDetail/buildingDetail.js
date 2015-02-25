Template.buildingDetail.created = function () {
    waterFluids = [];
};

Template.buildingDetail.rendered = function () {

    //Reset the var session associated to the Selector
    Session.set("current_lease_id", null);

    var current_building_doc_id = Session.get('current_building_doc')._id;
    allLeases = Leases.find({building_id:current_building_doc_id}).fetch();

    /* ---------------------*/
    //get the Water fluids for each Lease

    _.each(allLeases, function(lease, i) {
        //For each lease, extract the fluid with the fluid_type to water
        _.each(lease.fluid_consumption_meter, function(entry, i) {
            if( entry.fluid_id.split(" - ")[1] == "fluid_water" ) {
                // surcharge: add the surface and id to make the average easier
                entry.surface = lease.area_by_usage;
                entry.lease_id = lease._id ;

                waterFluids.push(entry);

            }
        });

    });
    console.log(waterFluids);

    /* ---------------------*/
    //Create data for the Pie
    /* ---------------------*/

    var dataHolder = [];
    var averagedData = {
        "text_domain": [],
        "data": []
    };
    var totalSurface = 0 ;


    // Build the text domain and the Data
    _.each(allLeases, function(entry, i) {
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



    /* ------------------------------ */
    //Create data for the DPE barchart
    /* ------------------------------ */
    //TODO

};



// Get list of all Portfolios for current Estate, sorted by alpha (on name)
Template.buildingDetail.helpers({
    getLeases: function(){
        var result = Leases.find( { building_id: Session.get('current_building_doc')._id },
                    {sort: {lease_name:1}}
                    ).fetch();

        return result;
    },
    waterConsumption: function(param, precision){
        if(waterFluids){ //wait until the waterFluids array has been generated
            if (Session.get("current_lease_id")) {
                // in waterFluids array, get the one corresponding to the Session var (set by selector)
                var correctWaterFluid = _.where(waterFluids, { lease_id: Session.get("current_lease_id") } )[0];

                if (param == "yearly_cost") {
                    return correctWaterFluid.yearly_cost;
                }
                if (param == "m3"){
                    return correctWaterFluid.first_year_value;
                }
                if (param == "m3/m2"){
                    return (correctWaterFluid.first_year_value / correctWaterFluid.surface).toFixed(precision);
                }
                if (param == "€/m3"){
                    return (correctWaterFluid.yearly_cost / correctWaterFluid.first_year_value).toFixed(precision);
                }
            }
            else {
                if (param == "yearly_cost") {
                    // return waterFluids.map(function(fluid){
                    //     return { label: item.end_use_name, value: item.first_year_value }
                    // });
                    return 0;
                }
                if (param == "m3"){
                    // return correctWaterFluid.first_year_value;
                    return 0;
                }
                if (param == "m3/m2"){
                    // return (correctWaterFluid.first_year_value / correctWaterFluid.surface).toFixed(precision);
                    return 0;
                }
                if (param == "€/m3"){
                    // return (correctWaterFluid.yearly_cost / correctWaterFluid.first_year_value).toFixed(precision);
                    return 0;
                }
            }
        }

    }
});


// Template.buildingDetail.events({
//     'change #leaseSelect': function(event) {
//         if (event.target.value == "all_leases") {
//             Session.set("current_lease_id", null);
//         } else {
//             Session.set("current_lease_id", event.target.value);
//         }
//    },
//    'click .update_lease': function(e) {
//         e.preventDefault();
//         Session.set('leaseToEdit', this); // "this" is passed by Meteor - it's the current item

//         console.log("current lease is: ");
//         console.log(this);

//         Router.go('leaseForm');
//     },
// });
