const http = require( "node:http" ),
    fs   = require( "node:fs" ),
    // IMPORTANT: you must run `npm install` in the directory for this assignment
    // to install the mime library if you're testing this on your local machine.
    // However, Glitch will install it automatically by looking in your package.json
    // file.
    mime = require( "mime" ),
    dir  = "public/",
    port = 3000

let gameID = 1;

const appdata = [];

// let fullURL = ""
const server = http.createServer( function( request,response ) {
    if( request.method === "GET" ) {
        handleGet( request, response )
    }else if( request.method === "POST" ){
        handlePost( request, response )
    }

    // The following shows the requests being sent to the server
    fullURL = `http://${request.headers.host}${request.url}`
    console.log( fullURL );
})

const handleGet = function( request, response ) {
    const filename = dir + request.url.slice( 1 )

    if( request.url === "/" ) {
        sendFile( response, "public/index.html" )
    }
    else if (request.url === "/getdata") {
        response.writeHead( 200, "OK", {"Content-Type": "text/plain" });
        response.end(JSON.stringify(appdata));
    }
    else{
        sendFile( response, filename )
    }
}

const handlePost = function( request, response ) {
    let dataString = ""

    request.on( "data", function( data ) {
        dataString += data
    })

    if (request.url === "/submit") {
        request.on("end", function () {
            let data = JSON.parse(dataString)
            data.gameID = gameID;
            gameID += 1;
            appdata.push(data);

            response.writeHead(200, "OK", {"Content-Type": "text/plain"})
            response.end(dataString)
        })
    }

    else if (request.url.startsWith("/delete/")) {
        const requestList = request.url.split("/");
        const id = requestList[requestList.length-1];

        for (let i = 0; i < appdata.length; i++) {
            if (appdata[i].gameID.toString() === id) {
                appdata.splice(i, 1);
                break;
            }
        }

        response.writeHead(200, "OK", {"Content-Type": "text/plain"})
        response.end(JSON.stringify(appdata))
    }
}

const sendFile = function( response, filename ) {
    const type = mime.getType( filename )

    fs.readFile( filename, function( err, content ) {

        // if the error = null, then we've loaded the file successfully
        if( err === null ) {

            // status code: https://httpstatuses.com
            response.writeHeader( 200, { "Content-Type": type })
            response.end( content )

        } else {

            // file not found, error code 404
            response.writeHeader( 404 )
            response.end( "404 Error: File Not Found" )

        }
    })
}

// process.env.PORT references the port that Glitch uses
// the following line will either use the Glitch port or one that we provided
server.listen( process.env.PORT || port )

