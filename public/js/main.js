// FRONT-END (CLIENT) JAVASCRIPT HERE

const submit = async function( event ) {
    // stop form submission from trying to load
    // a new .html page for displaying results...
    // this was the original browser behavior and still
    // remains to this day
    event.preventDefault()

    const input = document.querySelector( "#gameform" );
    const formData = new FormData(input);
    const object = {};
    formData.forEach(function(value, key){
        object[key] = value; });
    //attach user to data
    object.user = window.localStorage.getItem("currentUser");
    const body = JSON.stringify( object );
    console.log(object);

    const response = await fetch( "/submit", {
        method:'POST',
        body: body,
        headers: {
            'Content-Type': 'application/json'
        }
    });

    const data = await response.json();

    //Create a new row to add based on the form data and append it to the table
    const table = document.getElementById("tabledata");
    const row = document.createElement("tr");
    row.innerHTML = `<td>` + data.name + `</td>` +
        `<td>` + data.platform + `</td>` +
        `<td>` + data.startdate + `</td>` +
        `<td>` + data.completiondate + `</td>` +
        `<td>` + data.rating + `</td>`;
    table.appendChild(row);

    refreshData();
}

window.onload = function() {
    const button = document.querySelector("button");
    refreshData();
    button.onclick = submit;
}


//Get all data from the server to display on the client site
async function getAllData() {
    const currentUser = window.localStorage.getItem("currentUser");
    const response = await fetch( `/getdata?user=${currentUser}`);
    const data = await response.json();
    const table = document.getElementById("tabledata");
    data.forEach(function(row) {
        const singlerow = document.createElement("tr");
        singlerow.innerHTML = `<td>` + row.name + `</td>` +
            `<td>` + row.platform + `</td>` +
            `<td>` + row.startdate + `</td>` +
            `<td>` + row.completiondate + `</td>` +
            `<td>` + row.rating + `</td>`;
        table.appendChild(singlerow);
        calculateDaysPlayed(singlerow);
        addModifyButton(singlerow, row);
        addDeleteButton(singlerow, row._id);
    });

}

//Refresh the table when changes are made to it
async function refreshData() {
    const table = document.getElementById("gametable");
    const oldBody = document.getElementById("tabledata");
    const emptyBody = document.createElement("tbody");
    emptyBody.id = "tabledata";
    table.replaceChild(emptyBody, oldBody);
    getAllData();

}

//Add the delete button to a row of the table
function addDeleteButton(row, position) {

    const newData = document.createElement("td");
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.onclick = function() {deleteRow(position)};
    newData.appendChild(deleteButton);
    row.appendChild(newData);
}

function addModifyButton(row, rowData) {

    const newData = document.createElement("td");
    const modifyButton = document.createElement("button");
    modifyButton.textContent = "Modify";
    modifyButton.onclick = function() {modifyRow(row, rowData)};
    newData.appendChild(modifyButton);
    row.appendChild(newData);
}

//Delete a row of the table when it's respective button is clicked
async function deleteRow(position) {
    const response = await fetch( `/delete/${position}`, {
        method:'POST',
    });

    refreshData();
}

async function modifyRow(row, rowData) {
    row.innerHTML = `
    <td><input type="text" value="${rowData.name}" id="name-input"></td>
    <td><input type="text" value="${rowData.platform}" id="platform-input"></td>
    <td><input type="date" value="${rowData.startdate}" id="startdate-input"></td>
    <td><input type="date" value="${rowData.completiondate}" id="completiondate-input"></td>
    <td><input type="text" value="${rowData.rating}" id="rating-input"></td>
    <td</td>
    <td><button onclick="saveChanges('${rowData._id}')">Save</button></td>
    `;
}

async function saveChanges(id) {
    const updatedData = {
        name: document.getElementById("name-input").value,
        platform: document.getElementById("platform-input").value,
        startdate: document.getElementById("startdate-input").value,
        completiondate: document.getElementById("completiondate-input").value,
        rating: document.getElementById("rating-input").value
    };

    const response = await fetch(`/modify/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData)
    });

    if (response.ok) {
        refreshData(); // Reload the table with updated data
    } else {
        console.error("Failed to update the data");
    }
}

//Calculate how many days it took for someone to complete a game based on the day they started and the date they completed it
function calculateDaysPlayed(row) {
    const startdate = Date.parse(row.cells[2].textContent);
    const completiondate = Date.parse(row.cells[3].textContent);
    const daysplayed = (completiondate - startdate) / 86400000;

    const newData = document.createElement("td");
    newData.textContent = (daysplayed).toString();
    row.appendChild(newData);
}
