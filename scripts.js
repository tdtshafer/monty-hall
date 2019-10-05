
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

window.onload = setupGame;

function setupGame() {
    doors = document.getElementsByClassName('door');
    doorsArray = Array.from(doors);
    
    randomizeDoors();

    doorsArray.forEach(function(door){
        doorTransitionHandler(door)
    })

    document.getElementById('yes_switch').addEventListener('click', switchConfirmed);
    document.getElementById('no_switch').addEventListener('click', switchRejected);
    document.getElementById('open_button').addEventListener('click', theBigReveal);
    document.getElementById('play_again').addEventListener('click', resetGame);
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
        if(!doorContents[i] && i !== doorSelectedIndex){
            indexToReveal = i;
            break;
        }
    }
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
    updateCommand('Would you like to change your guess?');
    showButton('switch_button_container');
    document.getElementById('yes_switch').innerHTML = "Switch to door " + getOtherDoor().id;
    document.getElementById('no_switch').innerHTML = "Stick with door " + doorSelectedText;
}

function getOtherDoor(){
    return doorsArray.find(function(door){
        console.log(numstringToIndex[door.id])
        console.log([indexToReveal, doorSelectedIndex])
        console.log(!(numstringToIndex[door.id] in [indexToReveal, doorSelectedIndex]))
        if (!([indexToReveal, doorSelectedIndex].includes(numstringToIndex[door.id]))){
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
    doorSelectedText = switchTo.id;
    hideButton('switch_button_container');
    showButton('play_again_container');
    showButton('open_button');
    updateCommand("You switched to door " + switchTo.id);
}

function switchRejected(){
    hideButton('yes_switch');
    hideButton('no_switch');
    showButton('play_again_container');
    showButton('open_button');
    updateCommand("You stuck with door " + doorSelectedText);
}

function theBigReveal(){
    let winningDoor = doorsArray[winningIndex];
    let selectedDoor = doorsArray[doorSelectedIndex];
    let otherDoor = doorsArray[numstringToIndex[getOtherDoor().id]];

    if(winningIndex===doorSelectedIndex){
        winningDoor.setAttribute('alt', 'Door ' + winningDoor.id + ": car");
        winningDoor.setAttribute('src', 'images/door_' + winningDoor.id + '_selected_car.png');
        winningDoor.setAttribute('class', 'car-door');

        otherDoor.setAttribute('alt', 'Door ' + otherDoor.id + ": goat");
        otherDoor.setAttribute('src', 'images/door_' + otherDoor.id + '_goat.png');
        otherDoor.setAttribute('class', 'goat-door');
    } else {
        selectedDoor.setAttribute('alt', 'Door ' + selectedDoor.id + ": goat");
        selectedDoor.setAttribute('src', 'images/door_' + selectedDoor.id + '_selected_goat.png');
        selectedDoor.setAttribute('class', 'goat-door');

        otherDoor.setAttribute('alt', 'Door ' + otherDoor.id + ": car");
        otherDoor.setAttribute('src', 'images/door_' + otherDoor.id + '_car.png');
        otherDoor.setAttribute('class', 'car-door');
    }

    updateCommand(winningIndex===doorSelectedIndex ? "Congratulations! You won!" : "No luck this time!");
    hideButton('open_button');
    showButton('play_again');
}

function resetGame(){
    doorsArray.forEach(function(door){
        door.setAttribute('alt', 'Door ' + door.id + ": closed");
        door.setAttribute('src', 'images/door_' + door.id + '_closed.png');
        door.setAttribute('class', 'door');
    })
    randomizeDoors();
    updateCommand('Choose a door');
    hideButton('play_again');
    hideButton('switch_button_container');
    showButton('yes_switch', 'inline');
    showButton('no_switch', 'inline');
    hideButton('switch_button_container');
    setupGame();
}

function updateCommand(string){
    let commands = document.getElementById('text_commands');
    commands.innerHTML = string;
}

function showButton(buttonId, displayType='block'){
    document.getElementById(buttonId).style.display = displayType;
}

function hideButton(buttonId){
    document.getElementById(buttonId).style.display = 'none';
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
