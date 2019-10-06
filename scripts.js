
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

//analysis stuff

function startSimulation(){
    removeFinalResultLine();
    document.getElementById("no_switch_guess").disabled = true;
    document.getElementById('start_simulation').removeEventListener('click', startSimulation);
    let noSwitchTrials = 100;
    let switchTrials = 50;
    runSwitchTrials(switchTrials);
    // addNoSwitchGuess(noSwitchTrials);
    // runNoSwitchTrials(noSwitchTrials);
    
}

var LONG_SLEEP = 100;
var SHORT_SLEEP = 2;

async function runSwitchTrials(numTrials){
    let data = [];
    // for (var i=1; i<=numTrials; i++){
    let trialResult = runOneSwitchTrial();
    console.log(trialResult);

}

function runOneSwitchTrial(){
    //set up doors
    let simulationDoors = document.getElementsByClassName('sim-door');
    simulationDoorsArray = Array.from(simulationDoors);
    let simulationDoorContents = [1, 0, 0];
    
    //randomize doors
    let randomNumber = Math.floor(Math.random()*3);
    for (var i=0; i<randomNumber; i++){
        simulationDoorContents.splice(0,0, simulationDoorContents.pop());
    }
    winningIndex = randomNumber;
    
    //make the guess
    var guess = Math.floor(Math.random()*3);

    //reveal one door
    for (var i=0; i<simulationDoorContents.length; i++){
        if(!simulationDoorContents[i] && i !== guess){
            var doorToRevealIndex = i;
            break;
        } 
    }

    //get door to switch to
    for (var i=0; i<simulationDoorContents.length; i++){
        if (!([doorToRevealIndex, guess].includes(numstringToIndex[simulationDoorsArray[i].id]))){
            var otherDoorIndex = i;
            break;
        }
    }

    

    return {
        value: guess===winningIndex ? 1 : 0, 
        selectedDoor: simulationDoorsArray[guess], 
        doorToReveal: simulationDoorsArray[doorToRevealIndex],
        switchTo: simulationDoorsArray[otherDoorIndex],
    };
}

async function runNoSwitchTrials(numTrials){
    let data = [];
    
    for (var i=1; i<=numTrials; i++){
        let trialResult = runOneNoSwitchTrial();
        let simSelectedDoor = trialResult.selectedDoor;
        
        data.push(trialResult.value);
        
        //show selected door
        simSelectedDoor.setAttribute('src', 'images/door_' + simSelectedDoor.id + '_selected.png');
        
        //sleep1
        i <= 5 ? await sleep(LONG_SLEEP) : await sleep(SHORT_SLEEP);
        
        //show open door
        let goatOrCarString = trialResult.value ? simSelectedDoor.id + '_selected_car.png' : simSelectedDoor.id + '_selected_goat.png'
        simSelectedDoor.setAttribute('src', 'images/door_' + goatOrCarString);
        simSelectedDoor.setAttribute('class', trialResult.value ? 'sim-car' : 'sim-goat');
        
        //sleep2
        i <= 5 ? await sleep(LONG_SLEEP) : await sleep(SHORT_SLEEP);
        
        //reset door images
        simSelectedDoor.setAttribute('src', 'images/door_' + simSelectedDoor.id + '_closed.png')
        simSelectedDoor.setAttribute('class', 'sim-door');

         //update chart
         updateChart(processData(data));
    }

    addFinalResultLine(processData(data)[data.length - 1]);
    document.getElementById('start_simulation').addEventListener('click', startSimulation);
    document.getElementById('start_simulation').innerHTML = "Run Again";
    
    
}

function runOneNoSwitchTrial(){
    //set up doors
    let simulationDoors = document.getElementsByClassName('sim-door');
    simulationDoorsArray = Array.from(simulationDoors);
    let simulationDoorContents = [1, 0, 0];
    
    //randomize doors
    let randomNumber = Math.floor(Math.random()*3);
    for (var i=0; i<randomNumber; i++){
        simulationDoorContents.splice(0,0, simulationDoorContents.pop());
    }
    winningIndex = randomNumber;
    
    //make the guess
    var guess = Math.floor(Math.random()*3);

    return {
        value: guess===winningIndex ? 1 : 0, 
        selectedDoor: simulationDoorsArray[guess], 
    };
}

function processData(data){
    let wins = 0;
    console.log(data);
    return data.map(function(datapoint, index){
        trialNumber = index+1;
        wins += datapoint;
        winPercentage = (wins/trialNumber)*100;
        let rvalue = {'value': winPercentage, 'trialNumber': trialNumber};
        return rvalue;
    });
}

function addNoSwitchGuess(trialNumber){
    //get form input
    let noSwitchGuess = document.getElementById('no_switch_guess').value;
    
    svg.append("line")
        .attr('class', 'guess')
		.style("stroke", "red")  // color the line
        .attr("x1", x(1)) 
        .attr("y1", y(noSwitchGuess))  
        .attr("x2", x(10))  
        .attr("y2", y(noSwitchGuess))

    svg.append("text")
        .attr("y", y(noSwitchGuess) - 10) //magic number here
        .attr("x", 2)
        .attr('text-anchor', 'left')
        .attr("class", "guess-label")
        .text("Your Guess: " + noSwitchGuess + "%");
}

function addFinalResultLine(finalResult){
    console.log(finalResult)
    svg.append("line")
        .attr('id', 'guess')
        .style("stroke", "green")  // color the line
        .attr("x1", x(1)) 
        .attr("y1", y(finalResult.value))  
        .attr("x2", x(finalResult.trialNumber))  
        .attr("y2", y(finalResult.value))

    svg.append("text")
        .attr("y", y(finalResult.value) - 10) //magic number here
        .attr("x", x(finalResult.trialNumber) - 160)
        .attr('text-anchor', 'right')
        .attr("id", "guess-label")
        .text("Simulation Result: " + Math.round(finalResult.value,1) + "%");
}

function removeFinalResultLine(){
    d3.select('#guess').remove();
    d3.select('#guess-label').remove();
}

function updateChart(data){
    let trialNumber = data[data.length-1].trialNumber;
    
    var	margin = {top: 30, right: 10, bottom: 20, left: 50},
        width = 600 - margin.left - margin.right,
        height = 450 - margin.top - margin.bottom;

    if(trialNumber>10){
        x.domain(d3.extent(data, function(d) { return d.trialNumber; }));
    } else {
        x.domain([1,10]);
    }
    

    // Select the section we want to apply our changes to
    var svg = d3.select("#chart").transition();

    // Make the changes
        svg.select(".line")   // change the line
            .attr("d", valueline(data));
        svg.select(".x.axis") // change the x axis
            // .duration(750)
            .call(xAxis);
        svg.select(".y.axis") // change the y axis
            // .duration(750)
            .call(yAxis);
        
        console.log(data);
        svg.select(".guess")   // change the guess line
            .attr("x2", x(Math.max(10,trialNumber)));
}       



// add the svg to the page without any data - will be updated as the data comes in

var data = [];

// Set the dimensions of the canvas / graph
var	margin = {top: 30, right: 10, bottom: 20, left: 50},
    width = 600 - margin.left - margin.right,
    height = 250 - margin.top - margin.bottom;

// Set the ranges
var	x = d3.scale.linear().range([0, width]);
var	y = d3.scale.linear().range([height, 0]);

// Define the axes
var	xAxis = d3.svg.axis().scale(x)
    .orient("bottom").ticks(5);

var	yAxis = d3.svg.axis().scale(y)
    .orient("left").ticks(4);

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
    x.domain([1, 10]);
    y.domain([0, 100]);

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
