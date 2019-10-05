
let stateTransition = {
    "closed": "selected",
    "selected": "selected",
    "revealWrong": "goat",
    "revealRight": "car",
}

numstringToIndex = {
    "one": 0,
    "two": 1,
    "three": 2,
}

var doors;
var doorsArray;
var doorContents = [1, 0, 0];
var doorSelectedIndex;
var doorSelectedText;
var winningIndex;
var indexToReveal;


window.onload = function() {
    doors = document.getElementsByClassName('door');
    doorsArray = Array.from(doors);
    console.log(doors);
    
    randomizeDoors();
    console.log(doorContents);

    doorsArray.forEach(function(door){
        doorTransitionHandler(door)
    })

    document.getElementById('yes_switch').addEventListener('click', switchConfirmed);
    document.getElementById('yes_switch').addEventListener('click', switchRejected);
};  

function formatDoorString(string, doorNumber, doorState){
    return string.replace('doorNumber', doorNumber)
                 .replace('doorState', doorState);
}

function doorTransitionHandler(door){
    door.addEventListener('click', doorListener);
}

async function doorListener(e){
    let doorNumber = e.srcElement.id;
    doorSelectedText = doorNumber;
    doorSelectedIndex = numstringToIndex[doorNumber];
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
    doorsArray.forEach(function(door){
        door.removeEventListener('click', doorListener)
    })

    updateCommand("You chose door " + doorNumber);

    await sleep(200); //2000

    revealOneWrongAnswer();
    promptSwitch();

}

function randomizeDoors(){
    let random_number = Math.round(Math.random()*(doorContents.length-1));
    for (var i=0; i<random_number; i++){
        doorContents.splice(0,0, doorContents.pop());
    }
    winningIndex = random_number;
}

function revealOneWrongAnswer(){
    for (var i=0; i<doorContents.length; i++){
        console.log(doorContents[i]);
        if(!doorContents[i] && i !== doorSelectedIndex){
            indexToReveal = i;
            break;
        }
    }
    console.log(indexToReveal);
    doorToReveal = doors[indexToReveal];
    let doorNumber = doorToReveal.id;
    let newDoorState = stateTransition['revealWrong'];

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

    doorToReveal.setAttribute('class', 'goat-door');
    doorToReveal.setAttribute('alt', newImageAlt);
    doorToReveal.setAttribute('src', newImageString);
    
    updateCommand('Door ' + doorNumber + ' contains a goat');
}

async function promptSwitch(){
    await sleep(200); //2000
    updateCommand('Would you like to switch your guess?');
    document.getElementById('switch_button_container').style.display = 'block';
    document.getElementById('yes_switch').innerHTML = "Switch to door " + getOtherDoor().id;
    document.getElementById('no_switch').innerHTML = "Stick with door " + doorSelectedText;
}

function getOtherDoor(){
    return doorsArray.find(function(door){
        if (!(numstringToIndex[door.id] in [indexToReveal, doorSelectedIndex])){
            return door;
        }
    });
}

function switchConfirmed(){
    let switchFrom = doorsArray[doorSelectedIndex];
    let switchTo = getOtherDoor();
    console.log(switchFrom);
    switchFrom.setAttribute('alt', 'Door ' + switchFrom.id + ": closed");
    switchFrom.setAttribute('src', 'images/door_' + switchFrom.id + '_closed.png');

    switchTo.setAttribute('alt', 'Door ' + switchTo.id + ": selected");
    switchTo.setAttribute('src', 'images/door_' + switchTo.id + '_selected.png');

    doorSelectedIndex = numstringToIndex[switchTo.id];
    doorSelectedText switchTo.id;
}

function switchRejected(){
    
}

function updateCommand(string){
    let commands = document.getElementById('text_commands');
    commands.innerHTML = string;
}


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }