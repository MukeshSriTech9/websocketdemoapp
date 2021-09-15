const socket = io({ autoConnect: false });


socket.onAny((event, ...args) => {
    console.log(event, args);
});

// Connection Error handler which was returned from next(new Error(message)) in server middleware authentication check 
socket.on("connect_error", (err) => {
    console.log("connect_error", err.message);
});

socket.on("private message", (message)=> {
    console.log("message", message);

    if (message.content.action == 'form_value_passing') {
        let data = message.content.data;
        console.log(data);
        // For now just set the value with ID, later changes will be needed as per different input Type and edge cases handling in case id is not passed.
        if (data.inputType == 'radio') {
            document.getElementsByName(data.name).forEach((e) => {
                if (e.id == data.id) { 
                    e.checked = data.checked;
                }
            });
        } else if (data.inputType == 'checkbox') {
            document.getElementById(data.id).checked = data.checked;
        } else {
            document.getElementById(data.id).value = data.value;
        }
    }
});

function initiateSocketConnection(source) {
    console.log(source);
    socket.auth = {sessionID: 123, authToken: 1234, source: source}; // Pass these credentials as per actual application setup. This is just here for demo. 
    socket.connect();
}

function onInput(e) {
    
    console.log(e.id, e.value, e.name, e.type);

    content = {
        action: "form_value_passing", 
        data : {
            "id": e.id,
            "value": e.value,
            "inputType": e.type,
            "name": e.name,
            "checked" : e.checked
        }
    }

    socket.emit("private message", {
        content
    });
}