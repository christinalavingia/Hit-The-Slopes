$(document).ready(function () {
    console.log("ready!");

    $("#zipForm").validate({
        rules: {
            zip: { zipCodeValidation: true } 
        },
        submitHandler: function () {
            console.log("valid form!");

            var userZip = $("#zip").val().trim();
            $("#zip").val("");
            $("#resultsData").empty();

            $.ajax({
                url: "https://maps.googleapis.com/maps/api/geocode/json?address=" + userZip + "&key=AIzaSyCtACpMRAILtspcD0Xv5L3SADKump8sbJk",
                method: "GET"
            }).then(function (response) {
                console.log(response);
                var maps = response.results[0];

                var lat = maps.geometry.location.lat;
                var long = maps.geometry.location.lng;

                $.ajax({
                    url: "https://cors-anywhere.herokuapp.com/http://api.powderlin.es/closest_stations?lat=" + lat + "&lng=" + long + "&data=true&days=0&count=5",
                    method: "GET"
                }).then(function (response) {
                    console.log(response);
                    var weather = response;
                    for (i = 0; i < weather.length; i++) {
                        (function (i) {
                            var snowDepth = weather[i].data[0]["Snow Depth (in)"];
                            var resortName = weather[i].station_information.name;
                            console.log(snowDepth, resortName);
                            var resortLat = weather[i].station_information.location.lat;
                            var resortLong = weather[i].station_information.location.lng;
                            $.ajax({
                                url: "https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=" + userZip + "&destinations=" + resortLat + "," + resortLong + "&key=AIzaSyCtACpMRAILtspcD0Xv5L3SADKump8sbJk",
                                method: "GET"
                            }).then(function (response) {
                                console.log(response);
                                var distance = response.rows[0].elements[0].distance.text;
                                var duration = response.rows[0].elements[0].duration.text;
                                console.log(distance, duration);

                                var resort = $("<div>");
                                resort.addClass("card");
                                var cardBody = $("<div>");
                                cardBody.addClass("card-body");

                                var container = $("<div>");
                                container.addClass("container");

                                var row = $("<div>");
                                row.addClass("row");

                                var resortBox = $("<div>");
                                resortBox.addClass("col-sm-4");
                                var resortTitle = $("<h4 id='resorts'>").text(resortName);
                                resortTitle.addClass("display-4");
                                resortBox.append(resortTitle);
                                row.append(resortBox);

                                var blank = $("<div>");
                                blank.addClass("col-sm-4");
                                row.append(blank);

                                var infoBox = $("<div>");
                                infoBox.addClass("col-sm-4");
                                var infoCon = $("<div>");
                                infoCon.addClass("container");
                                var snowRow = $("<div>");
                                snowRow.addClass("row")
                                snowRow.text("Snowfall: " + snowDepth + " in");
                                infoCon.append(snowRow);
                                var distanceRow = $("<div>");
                                distanceRow.addClass("row");
                                distanceRow.text("Distance: " + distance);
                                infoCon.append(distanceRow);
                                var durationRow = $("<div>");
                                durationRow.addClass("row");
                                durationRow.text("Duration: " + duration);
                                infoCon.append(durationRow);

                                infoBox.append(infoCon);
                                row.append(infoBox);
                                container.append(row);
                                cardBody.append(container);
                                resort.append(cardBody);

                                $("#resultsData").append(resort);
                            });
                        })(i);
                    }
                });
            });
        },
        invalidHandler: function () {
            console.log("invalid form!");
            $("#resultsData").empty();
            $("#zip").val("");
        }
    });

    $.validator.addMethod("zipCodeValidation", function () {
        var zipCode = $('#zip').val();
        return (/(^\d{5}$)/).test(zipCode); 
    }, "Please enter a valid US zip code.");

    $("#search").on("click", function (event) {
        var form = $("#zipForm");
        form.validate();
    });


});

