let stateTransition = {
    "closed": "selected",
    "selected": "selected",
}

var doors;
var gameStage = 0;

window.onload = function() {
    doors = Array.from(document.getElementsByClassName('door'));
    console.log(doors);
    doors.forEach(function(door){
        doorTransitionHandler(door)
    })
};  

function formatDoorString(string, doorNumber, doorState){
    return string.replace('doorNumber', doorNumber)
                 .replace('doorState', doorState);
}

function doorTransitionHandler(door){
    door.addEventListener('click', doorListener );
}

function doorListener(e){
    let doorNumber = e.srcElement.id;
    let doorState = e.srcElement.alt.split(' ').slice(-1)[0];
    let newDoorState = stateTransition[doorState];
    console.log(newDoorState);
    console.log(stateTransition);
    let newImageString = formatDoorString(
        'images/door_doorNumber_doorState.png', 
        doorNumber, 
        newDoorState
    );
    let newImageAlt = formatDoorString(
        'Door doorNumber: doorState', 
        doorNumber, 
        newDoorState
    );
    console.log(doorNumber);
    console.log(doorState);
    e.srcElement.setAttribute('alt', newImageAlt);
    e.srcElement.setAttribute('src', newImageString);
    doors.forEach(function(door){
        door.removeEventListener('click', doorListener)
    })
    let commands = document.getElementById('text_commands');
    console.log(commands);
    commands.innerHTML = "";

}
