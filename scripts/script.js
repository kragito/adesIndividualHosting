//variables to be used later
let j = 0;
let inactiveQueues = [];
let activeQueues = [];

//<div class="loader" id="loader${j}"></div>

//add new tracking
addTracking = () => {
    //push empty arrays into the 2 main arrays
    inactiveQueues.push([]);
    activeQueues.push([]);
    let tracking = `<div class="track" id="track${j}">
                        <button class="close" id="close${j}" onclick=deleteTracking(${j})>X</button>
                        <label for="companyid${j}">Company ID</label>
                        <input type="text" name="companyid${j}" id="companyid${j}" class="companyid">
                        <button type="submit" class="search${j}" id="search${j}" onclick=searchQueue(${j})>Search</button><br>
                        <div id="loader${j}" class="lds-dual-ring hidden overlay loader"></div>
                        
                        <label for="queueid${j}">Queue ID</label>
                        <select name="queueid${j}" id="queueid${j}" class="queueid" onchange="arrivalRate(${j})">
                        </select>

                        <label for="hide${j}">Hide inactive</label>
                        <input type="checkbox" name="hide${j}" id="hide${j}" onclick="checkQueueActivity(${j})" checked>
                        <canvas id="myChart${j}" width="200" height="150"></canvas>
                    </div>`;
    document.getElementById("addtrack").insertAdjacentHTML("beforebegin", tracking);
    console.log(`Add new tracking ${j}`);
    j++;
};

//hide or show inactive queue
checkQueueActivity = (id) => {
    let $dropdown = $(`#queueid${id}`);
    if ($(`#hide${id}`).prop('checked')) {
        //if hide is checked, empty the options in select and populate with active queues only
        $dropdown.empty();
        for (let i = 0; i < activeQueues[id].length; i++) {
            $dropdown.append(activeQueues[id][i]);
        }
        console.log(activeQueues[id])
    } else {
        //if hide is unchecked, append inactive queues to select
        for (let i = 0; i < inactiveQueues[id].length; i++) {
            $dropdown.append(inactiveQueues[id][i]);
        }
        console.log(inactiveQueues[id])
    }
};

//get queue
searchQueue = (id) => {
    //get companyid from textbox
    companyid = $(`#companyid${id}`).val();
    $.ajax({
        url: "http://localhost:8080/company/queue",
        data: { "company_id": companyid },
        type: 'GET',
        contentType: "application/json; charset=utf-8",
        dataType: 'json',
        beforeSend: function () {
            //before we send the request, remove the .hidden class from the spinner and default to inline-block.
            $(`#loader${id}`).removeClass('hidden')
        },
        success: function (data, textStatus, xhr) {
            //reset the arrays in the 2 main array
            inactiveQueues[id] = [];
            activeQueues[id] = [];
            if (data.length == 0) {
                //if companyid is not found
                alert("Company ID not found");
            }
            else {
                let $dropdown = $(`#queueid${id}`);
                $dropdown.empty();
                $(`#loader${id}`).addClass('hidden')
                for (let i = 0; i < data.length; i++) {
                    //deactivate inactive queues
                    if ($(`#hide${id}`).prop('checked')) {
                        if (data[i].is_active == 1) {
                            activeQueues[id].push(`<option value=${data[i].queue_id}>${data[i].queue_id}</option>`);
                            $dropdown.append(`<option value=${data[i].queue_id}>${data[i].queue_id}</option>`);
                        }
                        else {
                            inactiveQueues[id].push(`<option value=${data[i].queue_id}>${data[i].queue_id} - inactive</option>`);
                        }
                        console.log("check");
                    }
                    else {
                        if (data[i].is_active == 1) {
                            activeQueues[id].push(`<option value=${data[i].queue_id}>${data[i].queue_id}</option>`);
                            $dropdown.append(`<option value=${data[i].queue_id}>${data[i].queue_id}</option>`);
                        }
                        else {
                            inactiveQueues[id].push(`<option value=${data[i].queue_id}>${data[i].queue_id} - inactive</option>`);
                            $dropdown.append(`<option value=${data[i].queue_id}>${data[i].queue_id} - inactive</option>`);
                        }
                        console.log("no");
                    }
                }
                $(`.loader${id}`).remove();
                arrivalRate(id);
            }
        },
        error: function (xhr, textStatus, errorThrown) {
            //error handling
            switch (xhr.status) {
                case 400: alert("Invalid Company ID"); console.log('Invalid Company ID entered'); break;
                case 500: alert(xhr.responseJSON.error); console.log(xhr.responseJSON.error); break;
                default: alert("Error"); console.log('Error in Operation');
            }
        }
    })
};

//delete tracking
deleteTracking = (id) => {
    console.log(`Removed tracking ${id}`);
    $(`#track${id}`).remove();
};

//check total active tracking
checkTracking = () => {
    $(`#trackingnumber`).replaceWith(`<h4 id="trackingnumber">Total number of tracks: ${$(`div`).find('.track').length}</h4>`)
    console.log(inactiveQueues);
    console.log(activeQueues);
};

//load rate of arrival to graph
arrivalRate = (id) => {
    //if tracking is not deleted
    if (document.getElementById(`queueid${id}`) != null) {
        counts = [];
        labels = [];
        c = new Date();
        d = new Date(c.getTime() - 3 * 60000);
        queue_id = document.getElementById(`queueid${id}`).value;
        duration = 3;
        from = d.toISOString();
        from = from.slice(0, from.length - 5);
        console.log(from);
        $.ajax({
            url: "http://localhost:8080/company/arrival_rate",
            data: { "queue_id": queue_id, "from": from + "+00:00", "duration": duration },
            //url: `http://localhost:8080/company/arrival_rate?queue_id=${queue_id}&from=2021-01-25T17:43:20%2B00:00&duration=${duration}`,
            type: 'GET',
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            success: function (data, textStatus, xhr) {
                for (let i = 0; i < data.length; i++) {
                    if (data[i].count != 0) {
                        counts.push(data[i].count)
                        label = new Date(data[i].timestamp * 1000).toLocaleString();
                        //label = label.slice(0, label.length - 6)
                        labels.push(label)
                        //console.log(data[i]);
                    }
                }
                let ctx = document.getElementById(`myChart${id}`);
                let myLineChart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: `# of Customers in ${queue_id}`,
                            data: counts,
                            backgroundColor: [
                                'rgba(255, 99, 132, 0.2)'
                            ],
                            borderWidth: 1,
                        }]
                    },
                    options: {
                        scales: {
                            yAxes: [{
                                ticks: {
                                    beginAtZero: true
                                }
                            }]
                        }
                    }
                });
                //reload graph after 3 seconds
                setTimeout(() => { arrivalRate(id); }, 3000);
            },
            error: function (xhr, textStatus, errorThrown) {
                console.log('Error in Operation');
                console.log(xhr);
                console.log(textStatus);
                console.log(errorThrown);
                alert("Arrival Rate got error");
            }
        })
    } else {
        console.log(`Deleted tracking ${id} halfway through showing graph`);
    }
};