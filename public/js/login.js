async function logIn(event) {
    event.preventDefault();
    console.log("eh");
    const data = await getUsers();

    const input = document.querySelector( "#loginform" );
    const formData = new FormData(input);
    const object = {};
    formData.forEach(function(value, key){
        object[key] = value; });
    const username = object.username;
    const password = object.password;

    for (let i = 0; i < data.length; i++) {
        if (username === data[i].username && password === data[i].password) {
            localStorage.setItem("currentUser", username);
            location.href = "/home";
        }
    }

}

async function getUsers() {
    const response = await fetch( "/getusers");
    const data = await response.json();
    console.log(data);
    return data;
}


document.getElementById('loginbutton').onclick = logIn;