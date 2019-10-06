
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
    document.getElementById('start_simulation').addEventListener('click', startSimulation);
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

//anysis stuff

function startSimulation(){
    document.getElementById('start_simulation').removeEventListener('click', startSimulation);
    let noSwitchTrials = 300;
    let switchTrials = 50;
    runNoSwitchTrials(noSwitchTrials);
    
}

function runNoSwitchTrials(numTrials){
    let data = [];
    
    for (var i=0; i<numTrials; i++){
        data.push(runOneNoSwitchTrial());
        // updateChart(data);
    }
    buildChart(processData(data));
}

function runOneNoSwitchTrial(){
    let simulationDoors = document.getElementsByClassName('simulation_door');
    
    simulationDoorsArray = Array.from(simulationDoors);
    let simulationDoorContents = [1, 0, 0];
    let randomNumber = Math.floor(Math.random()*3);
    for (var i=0; i<randomNumber; i++){
        simulationDoorContents.splice(0,0, simulationDoorContents.pop());
    }
    winningIndex = randomNumber;
    var value;
    var guess = Math.floor(Math.random()*2.99);
    console.log("GUESS: " + guess);
    console.log(simulationDoorsArray);
    simulationDoorsArray[guess].setAttribute('src', 'images/door_' + simulationDoorsArray[guess].id + '_selected.png');
    if(guess===winningIndex){
        simulationDoors[guess].setAttribute(
            'src', 'images/door_' + simulationDoorsArray[guess].id + '_selected_car.png'
        );
        simulationDoorsArray[guess].setAttribute('class', 'sim-car-class');
        value = 1;
    } else {
        simulationDoorsArray[guess].setAttribute('src', 'images/door_' + simulationDoorsArray[guess].id + '_selected_goat.png');
        simulationDoorsArray[guess].setAttribute('class', 'sim-goat-class');
        value = 0;
    }

    simulationDoorsArray[guess].setAttribute('src', 'images/door_' + simulationDoorsArray[guess].id + '_closed.png');
    simulationDoorsArray[guess].setAttribute('class', 'simulation_door');

    return value;
}

function processData(data){
    let wins = 0;

    return data.map(function(datapoint, index){
        console.log(datapoint);
        console.log(index);
        trialNumber = index+1;
        wins += datapoint;
        winPercentage = wins/trialNumber;
        console.log(winPercentage);
        let rvalue = {'value': winPercentage, 'trialNumber': trialNumber};
        console.log(rvalue);
        return rvalue;
    });
}

function updateChart(data){

}
function buildChart(data){
    // Set the dimensions of the canvas / graph
    var	margin = {top: 30, right: 10, bottom: 20, left: 30},
        width = 400 - margin.left - margin.right,
        height = 150 - margin.top - margin.bottom;

    // Set the ranges
    var	x = d3.scale.linear().range([0, width]).domain([0,1]);
    var	y = d3.scale.linear().range([height, 0]).domain([0,1]);

    // Define the axes
    var	xAxis = d3.svg.axis().scale(x)
        .orient("bottom").ticks(5);

    var	yAxis = d3.svg.axis().scale(y)
        .orient("left").ticks(4 );

    // Define the line
    var	valueline = d3.svg.line()
        .x(function(d) { return x(d.trialNumber);})
        .y(function(d) { return y(d.value); });
        
    // Adds the svg canvas
    var	svg = d3.select("#chart")
        .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // Scale the range of the data
        x.domain(d3.extent(data, function(d) { return d.trialNumber; }));
        y.domain([0, d3.max(data, function(d) { return d.value; })]);

        // Add the valueline path.
        svg.append("path")
            .attr("class", "line")
            .attr("d", valueline(data));

        // Add the X Axis
        svg.append("g")	
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        // Add the Y Axis
        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis);
}
