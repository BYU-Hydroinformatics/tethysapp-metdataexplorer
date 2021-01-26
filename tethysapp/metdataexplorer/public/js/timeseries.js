function getTimeseries(coord) {
    if (subsetURL == '') {
        alert('Please select a data layer.');
    } else {
        $('#loading-model').modal('show');
        var maxlat = coord[0][2].lat;
        var maxlng = coord[0][2].lng;
        var minlat = coord[0][0].lat;
        var minlng = coord[0][0].lng;
        var vars = $('#variable-input').val();
        var time = $('#time').val();
        var subsetUrlFull = `${subsetURL}?var=${vars}&north=${maxlat}&west=${minlng}&east=${maxlng}&south=${minlat}&disableProjSubset=on&horizStride=1&temporal=all`;
        $.ajax({
            url: URL_getBoxValues,
            data: {
                'subsetURL': subsetUrlFull,
                'var': vars,
                'time': time,
            },
            dataType: 'json',
            contentType: "application/json",
            method: 'GET',
            success: function (result) {
                var data = result['data'];
                if (data == false) {
                    $('#loading-model').modal('hide');
                    alert('Invalid dimensions');
                } else {
                    drawGraph(data);
                    $('#loading-model').modal('hide');
                    $('#timeseries-model').modal('show');
                }
            },
        });
    }
}

function drawGraph(data) {
    var series = $.parseJSON(data);
    let x = [];
    let y = [];
    for (var i = 0; i < Object.keys(series['timeseries']).length; i++) {
        x.push(series['timeseries'][i]);
        y.push(series['mean'][i]);
    }
    let variable = $('#variable-input').val();
    let layout = {
        title: 'Mean of ' + variable,
        xaxis: {title: 'Time', type: 'datetime'},
        yaxis: {title: 'Amount'}
    };
    let values = {
        x: x,
        y: y,
        mode: 'lines+markers',
        type: 'scatter'
    };
    Plotly.newPlot('chart', [values], layout);
    let chart = $("#chart");
    chart.css('height', 500);
    Plotly.Plots.resize(chart[0]);
}

// Add function to save chart to CSV

function chartToCSV() {
    function zip(arrays) {
        return arrays[0].map(function (_, i) {
            return arrays.map(function (array) {
                return array[i]
            })
        });
    }

    if (chartdata === {}) {
        alert('There is no data in the chart. Please plot some data first.');
        return
    }
    let data = zip([chartdata.x, chartdata.y]);
    let csv = "data:text/csv;charset=utf-8," + data.map(e => e.join(",")).join("\n");
    let link = document.createElement('a');
    link.setAttribute('href', encodeURI(csv));
    link.setAttribute('target', '_blank');
    link.setAttribute('download', 'extracted_time_series.csv');
    document.body.appendChild(link);
    link.click();
    $("#a").remove()
}

// WHEN YOU CLICK ON THE DOWNLOAD BUTTON- RUN THE DOWNLOAD CSV FUNCTION
$("#download-csv").click(chartToCSV);