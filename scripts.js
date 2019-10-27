
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

//classes aren't hoisted, so this goes near the top
class VariableGame{
    constructor(){
        this.numberOfDoors = 100;
        this.winningId = Math.round(Math.random()*99) + 1;
        this.selectedDoor;
        this.otherId;
        this.contingencyId = -1;
        this.variableDoorsDiv = document.getElementById('variable_doors');
    }

    buildDoors(){
        for(var i=0; i < this.numberOfDoors; i++){
            var tinyDoor = document.createElement('img');
            tinyDoor.setAttribute('src', 'images/unmarked_closed.png');
            tinyDoor.setAttribute('alt', 'tiny closed door');
            tinyDoor.setAttribute('id', i+1);
            tinyDoor.setAttribute('class', 'tiny-door');
            tinyDoor.addEventListener('click', this.tinyDoorClick);
            this.variableDoorsDiv.appendChild(tinyDoor);
        }
    };

    async tinyDoorClick(clickedDoor){
        // this function's style doesn't match the others in this class
        // the reason: this function is an event handler which means
        // the `this` object is bound to the HTML element passed in, 
        // not the class itself. For that reason you'll see `Variable.x`
        // notation instead of `this.x`

        //remove all listeners
        for(var i=0; i < Variable.variableDoorsDiv.children.length; i++){
            let door = Variable.variableDoorsDiv.children[i];
            door.removeEventListener('click', Variable.tinyDoorClick);
        };
    
        Variable.selectedDoor = clickedDoor.srcElement;
        clickedDoor.srcElement.setAttribute('src', 'images/unmarked_selected.png');
        clickedDoor.srcElement.setAttribute('alt', 'tiny closed door selected');
        
        Variable.getContingencyId();
        updateCommand("You chose door " + this.id, '100_text_commands');
        await sleep(1000);
        Variable.revealWrongAnswers();
    };

    getContingencyId(){
        if (this.selectedDoor.id == this.winningId){
            let randomNumber = Math.round(Math.random()*99) + 1;
            this.contingencyId = randomNumber == this.winningId ? randomNumber : randomNumber + 1;
            if (this.contingencyId > 100){
                // extremely rare case that both random 
                // numbers (winningId and contingencyId) are exactly 100
                this.contingencyId = Math.round(Math.random()*98) + 1;
            }
        }
    };

    async revealWrongAnswers(){
        updateCommand('All these doors contains goats', '100_text_commands');
        for(var i=0; i < this.variableDoorsDiv.children.length; i++){
            let door = this.variableDoorsDiv.children[i];
            if( door.id != this.selectedDoor.id && 
                door.id != this.winningId && 
                door.id != this.contingencyId){
                    await sleep(10);
                    door.setAttribute('src', 'images/unmarked_goat.png');
                    door.setAttribute('alt', 'tiny door open with goat');
            }
        };
        
        this.promptVariableSwitch();
    };

    async promptVariableSwitch(){
        await sleep(2000);
        updateCommand('Would you like to change your guess?', '100_text_commands');
        showButton('yes_switch_variable');
        showButton('no_switch_variable');
        this.otherId = this.contingencyId > 0 ? this.contingencyId : this.winningId;
        document.getElementById('yes_switch_variable').innerHTML = "Switch to door " + this.otherId;
        document.getElementById('no_switch_variable').innerHTML = "Stick with door " + this.selectedDoor.id;
    }

    switchConfirmed(){
        // as an event handler `this` is bound to the incoming HTML object
        
        document.getElementById('yes_switch_variable').removeEventListener('click', Variable.switchConfirmed);
        document.getElementById('no_switch_variable').removeEventListener('click', Variable.switchRejected);

        let switchFrom = Variable.selectedDoor;
        let switchTo = Variable.variableDoorsDiv.children[Variable.otherId-1];
    
        switchFrom.setAttribute('src', 'images/unmarked_closed.png');
        switchFrom.setAttribute('alt', 'tiny door closed');

        switchTo.setAttribute('src', 'images/unmarked_selected.png');
        switchTo.setAttribute('alt', 'tiny door selected');
    
        Variable.otherId = switchFrom.id;
        Variable.selectedDoor = switchTo;
        
        collapseDiv('yes_switch_variable');
        collapseDiv('no_switch_variable');
        restoreDiv('open_button_variable', 'initial');
        showButton('open_button_variable');
        updateCommand("You switched to door " + Variable.selectedDoor.id, "100_text_commands");
    }

    switchRejected(){
        // as an event handler `this` is bound to the incoming HTML object
        document.getElementById('yes_switch_variable').removeEventListener('click', Variable.switchConfirmed);
        document.getElementById('no_switch_variable').removeEventListener('click', Variable.switchRejected);
        collapseDiv('yes_switch_variable');
        collapseDiv('no_switch_variable');
        restoreDiv('open_button_variable', 'initial');
        showButton('open_button_variable');
        updateCommand("You stuck with door " + Variable.selectedDoor.id, "100_text_commands");
    }

    theBigRevealVariable(){
        // as an event handler `this` is bound to the incoming HTML object

        let isWinner = Variable.winningId===parseInt(Variable.selectedDoor.id);
        if(isWinner){
            Variable.selectedDoor.setAttribute('src', 'images/unmarked_selected_car.png');
            Variable.selectedDoor.setAttribute('alt', 'open door with car');
            
            let otherDoor = Variable.variableDoorsDiv.children[Variable.otherId-1];
            otherDoor.setAttribute('src', 'images/unmarked_goat.png');
            otherDoor.setAttribute('alt', 'open door with goat');
        } else {
            Variable.selectedDoor.setAttribute('src', 'images/unmarked_selected_goat.png');
            Variable.selectedDoor.setAttribute('alt', 'open door with goat');
            
            let otherDoor = Variable.variableDoorsDiv.children[Variable.otherId-1];
            otherDoor.setAttribute('src', 'images/unmarked_car.png');
            otherDoor.setAttribute('alt', 'open door with car');
        }
        updateCommand(
            isWinner ? "Congratulations! You won!" : "No luck this time!",
            "100_text_commands",
        );
        hideButton('open_button_variable');
        collapseDiv('open_button_variable');
        restoreDiv('play_again_variable', 'inline');
        showButton('play_again_variable');
    }

    resetGameVariable(){
        
        while (Variable.variableDoorsDiv.firstChild) {
            Variable.variableDoorsDiv.removeChild(Variable.variableDoorsDiv.firstChild);
        }


        updateCommand('pick a door', '100_text_commands');
        hideButton('play_again_variable');
        collapseDiv('play_again_variable');
        showButton('yes_switch_variable');
        showButton('no_switch_variable');
        restoreDiv('yes_switch_variable', 'inline');
        restoreDiv('no_switch_variable', 'inline');
        hideButton('yes_switch_variable');
        hideButton('no_switch_variable');
        document.getElementById('yes_switch_variable').addEventListener('click', Variable.switchConfirmed);
        document.getElementById('no_switch_variable').addEventListener('click', Variable.switchRejected);

        Variable.numberOfDoors = 100;
        Variable.winningId = Math.round(Math.random()*99) + 1;
        Variable.selectedDoor = null;   
        Variable.otherId = null;
        Variable.contingencyId = -1;
        Variable.buildDoors();
    }
}

window.onload = setupGame;

function setupGame() {
    Variable = new VariableGame();
    Variable.buildDoors();

    doors = document.getElementsByClassName('door');
    doorsArray = Array.from(doors);
    
    randomizeDoors();

    doorsArray.forEach(function(door){
        doorTransitionHandler(door)
    })

    //legacy handlers
    document.getElementById('yes_switch').addEventListener('click', switchConfirmed);
    document.getElementById('no_switch').addEventListener('click', switchRejected);
    document.getElementById('open_button').addEventListener('click', theBigReveal);
    document.getElementById('play_again').addEventListener('click', resetGame);

    //VariableGame handlers
    document.getElementById('yes_switch_variable').addEventListener('click', Variable.switchConfirmed);
    document.getElementById('no_switch_variable').addEventListener('click', Variable.switchRejected);
    document.getElementById('open_button_variable').addEventListener('click', Variable.theBigRevealVariable);
    document.getElementById('play_again_variable').addEventListener('click', Variable.resetGameVariable);

    document.getElementById('start_simulation').addEventListener('click', startSimulation);
    document.getElementById('show-text-button').addEventListener('click', showTextHandler);
    document.getElementById('show-percentages-button').addEventListener('click', showPercentagesHandler);
};  

function formatDoorString(string, doorNumber, doorState){
    return string.replace('doorNumber', doorNumber)
                 .replace('doorState', doorState);
}

function doorTransitionHandler(door){
    door.addEventListener('click', doorListener);
}

function changeDoor(door, newState, newClass=null){
    door.setAttribute('alt', 'Door ' + door.id + ": " + newState);
    door.setAttribute('src', 'images/door_' + door.id + '_' + newState +'.png');
    if(newClass){
        door.setAttribute('class', newClass);
    }   
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
    e.srcElement.setAttribute('alt', newImageAlt);
    e.srcElement.setAttribute('src', newImageString);
    doorsArray.forEach(function(door){
        door.removeEventListener('click', doorListener)
    })

    updateCommand("You chose door " + doorNumber);

    await sleep(1000); //1000

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
    changeDoor(doorToReveal, 'goat')
    updateCommand('Door ' + doorToReveal.id + ' contains a goat');
}

async function promptSwitch(){
    await sleep(2000); //2000
    updateCommand('Would you like to change your guess?');
    showButton('yes_switch');
    showButton('no_switch');
    document.getElementById('yes_switch').innerHTML = "Switch to door " + getOtherDoor().id;
    document.getElementById('no_switch').innerHTML = "Stick with door " + doorSelectedText;
}

function getOtherDoor(){
    return doorsArray.find(function(door){
        if (!([indexToReveal, doorSelectedIndex].includes(numstringToIndex[door.id]))){
            return door;
        }
    });
}

function switchConfirmed(){
    let switchFrom = doorsArray[doorSelectedIndex];
    let switchTo = getOtherDoor();

    changeDoor(switchFrom, 'closed');
    changeDoor(switchTo, 'selected');

    doorSelectedIndex = numstringToIndex[switchTo.id];
    doorSelectedText = switchTo.id;
    collapseDiv('yes_switch');
    collapseDiv('no_switch');
    restoreDiv('open_button', 'initial');
    showButton('open_button');
    updateCommand("You switched to door " + switchTo.id);
}

function switchRejected(){
    collapseDiv('yes_switch');
    collapseDiv('no_switch');
    restoreDiv('open_button', 'initial');
    showButton('open_button');
    updateCommand("You stuck with door " + doorSelectedText);
}

function theBigReveal(){
    let winningDoor = doorsArray[winningIndex];
    let selectedDoor = doorsArray[doorSelectedIndex];
    let otherDoor = doorsArray[numstringToIndex[getOtherDoor().id]];

    if(winningIndex===doorSelectedIndex){
        changeDoor(winningDoor, 'selected_car');
        changeDoor(otherDoor, 'goat');
    } else {
        changeDoor(selectedDoor, 'selected_goat');
        changeDoor(otherDoor, 'car');
    }
    updateCommand(winningIndex===doorSelectedIndex ? "Congratulations! You won!" : "No luck this time!");
    hideButton('open_button');
    collapseDiv('open_button');
    restoreDiv('play_again', 'inline');
    showButton('play_again');
}

function resetGame(){
    doorsArray.forEach(function(door){
        changeDoor(door, 'closed', 'door');
    })
    randomizeDoors();
    updateCommand('pick a door');
    hideButton('play_again');
    collapseDiv('play_again');
    showButton('yes_switch');
    showButton('no_switch');
    restoreDiv('yes_switch', 'inline');
    restoreDiv('no_switch', 'inline');
    hideButton('yes_switch');
    hideButton('no_switch');
    setupGame();
}

function updateCommand(string, idString='text_commands'){
    let commands = document.getElementById(idString);
    commands.innerHTML = string;
}

function showButton(buttonId){
    document.getElementById(buttonId).style.visibility = 'visible';
}

function hideButton(buttonId){
    document.getElementById(buttonId).style.visibility = 'hidden';
}

function collapseDiv(buttonId){
    document.getElementById(buttonId).style.display = 'none';
}

function restoreDiv(buttonId, displayType){
    document.getElementById(buttonId).style.display = displayType;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }


function showTextHandler(){
    let table = document.getElementById('outcomes-table')
    table.setAttribute('alt', 'Table with text');
    table.setAttribute('src', 'images/table_with_text.png');
}

function showPercentagesHandler(){
    let table = document.getElementById('outcomes-table')
    table.setAttribute('alt', 'Table with percentages');
    table.setAttribute('src', 'images/table_with_numbers.png');
}

//analysis stuff

function startSimulation(){
    removeFinalResultLine();
    document.getElementById("no_switch_guess").disabled = true;
    document.getElementById('start_simulation').removeEventListener('click', startSimulation);
    // let noSwitchTrials = 100;
    // let switchTrials = 100;
    let numberOfTrials = 200;
    alternateTrials(numberOfTrials);
    addGuessLine(numberOfTrials);
    // runSwitchTrials(numberOfTrials);
    // runNoSwitchTrials(noSwitchTrials);
    
}

var LONG_SLEEP = 1000;
var SHORT_SLEEP = 2;

async function variableSleep(trialNumber){
    trialNumber <= 5 ? await sleep(LONG_SLEEP) : await sleep(SHORT_SLEEP);
}

async function alternateTrials(numberOfTrials){
    var switchData = [];
    var noSwitchData = [];
    for (var i=1; i<=numberOfTrials; i++){
        switchData = await runSwitchTrials(1, switchData, noSwitchData, i);
        updateChart(processData(switchData), 'switch-line');
        updateChart(processData(noSwitchData), 'no-switch-line');
        // noSwitchData = await runNoSwitchTrials(1, noSwitchData, i);
    }
    addFinalResultLine(processData(switchData)[switchData.length - 1], 'Switch');

    // addFinalResultLine(processData(noSwitchData)[noSwitchData.length - 1], 'No switch');
    
    document.getElementById('start_simulation').addEventListener('click', startSimulation);
    document.getElementById('start_simulation').innerHTML = "Run Again"; 
}

async function runSwitchTrials(numTrials, data, inverseData, trialNumber){
    let trialResult = runOneSwitchTrialLogic();
    
    let simSelectedDoor = trialResult.selectedDoor;
    
    data.push(trialResult.value);
    inverseData.push(trialResult.value ? 0 : 1);
    
    //show selected door
    changeDoor(simSelectedDoor, 'selected_mixed');
    
    //sleep1
    await variableSleep(trialNumber);
    
    //reveal one wrong answer
    changeDoor(trialResult.doorToReveal, 'goat');

    //sleep2
    await variableSleep(trialNumber);

    //switch guess
    changeDoor(simSelectedDoor, 'selected_orange');
    changeDoor(trialResult.switchTo, 'selected_purple');

    //sleep3
    await variableSleep(trialNumber);

    //show open door
    let switchGoatOrCarString = trialResult.value ? 'selected_car_purple' : 'selected_goat_purple';
    changeDoor(trialResult.switchTo, switchGoatOrCarString);

    let stayGoatOrCarString = trialResult.value ? 'selected_goat_orange': 'selected_car_orange';
    changeDoor(simSelectedDoor, stayGoatOrCarString);
    
    //sleep4
    await variableSleep(trialNumber);
    
    //reset door images
    changeDoor(trialResult.switchTo, 'closed');
    changeDoor(trialResult.doorToReveal, 'closed');
    changeDoor(simSelectedDoor, 'closed');

    //update chart
    // updateChart(processData(data), 'switch-line');

    return data;
}

function runOneSwitchTrialLogic(){
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
        value: otherDoorIndex===winningIndex ? 1 : 0, 
        selectedDoor: simulationDoorsArray[guess], 
        doorToReveal: simulationDoorsArray[doorToRevealIndex],
        switchTo: simulationDoorsArray[otherDoorIndex],
    };
}

async function runNoSwitchTrials(numTrials, data, trialNumber){
    let trialResult = runOneNoSwitchTrialLogic();
    let simSelectedDoor = trialResult.selectedDoor;
    
    data.push(trialResult.value);
    
    //show selected door
    changeDoor(simSelectedDoor, 'selected');
    
    //sleep1
    await variableSleep(trialNumber);
    
    //show open door
    let goatOrCarString = trialResult.value ? 'selected_car' : 'selected_goat';
    changeDoor(simSelectedDoor, goatOrCarString)
    
    //sleep2
    await variableSleep(trialNumber);
    
    //reset door images
    changeDoor(simSelectedDoor, 'closed');

    //update chart
    updateChart(processData(data), 'no-switch-line');

    return data 
}

function runOneNoSwitchTrialLogic(){
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
    return data.map(function(datapoint, index){
        trialNumber = index+1;
        wins += datapoint;
        winPercentage = (wins/trialNumber)*100;
        let rvalue = {'value': winPercentage, 'trialNumber': trialNumber};
        return rvalue;
    });
}

function addGuessLine(trialNumber){
    //get form input
    let noSwitchGuess = document.getElementById('no_switch_guess').value;
    
    svg.append("line")
        .attr('class', 'guess')
        .style("stroke", "red")  // color the line
        .style("stroke-width", 2)
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

function addFinalResultLine(finalResult, strategy){
    svg.append("line")
        .attr('class', 'guess')
        .style("stroke", "green")  // color the line
        .style("stroke-width", 2)
        .attr("x1", x(1)) 
        .attr("y1", y(finalResult.value))  
        .attr("x2", x(finalResult.trialNumber))  
        .attr("y2", y(finalResult.value))

    svg.append("text")
        .attr("y", y(finalResult.value) - 10) //magic number here
        .attr("x", x(finalResult.trialNumber) - 160)
        .attr('text-anchor', 'right')
        .attr("class", "guess-label")
        .text(strategy + " Result: " + Math.round(finalResult.value,1) + "%");
}

function removeFinalResultLine(){
    d3.selectAll('.guess').remove();
    d3.selectAll('.guess-label').remove();
}

function updateChart(data, line){
    let trialNumber = data[data.length-1].trialNumber;
    
    var	margin = {top: 30, right: 10, bottom: 20, left: 50},
        width = 600 - margin.left - margin.right,
        height = 250 - margin.top - margin.bottom;

    if(trialNumber>10){
        x.domain(d3.extent(data, function(d) { return d.trialNumber; }));
    } else {
        x.domain([1,10]);
    }
    
    // Select the section we want to apply our changes to
    var svg = d3.select("#chart").transition();

    // Make the changes
        svg.select('#'+line)   // change the line passed in
            .attr("d", valueline(data));
        svg.select(".x.axis") // change the x axis
            // .duration(750)
            .call(xAxis);
        svg.select(".y.axis") // change the y axis
            // .duration(750)
            .call(yAxis);
        
        svg.select(".guess")   // change the guess line
            .attr("x2", x(Math.max(10,trialNumber)));
}       

// add the svg to the page without any data - will be updated as the data comes in

var data = [];

// Set the dimensions of the canvas / graph
var	margin = {top: 30, right: 30, bottom: 30, left: 50},
    width = 800 - margin.left - margin.right,
    height = 350 - margin.top - margin.bottom;

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
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "-90 0 1000 750")
        .classed("svg-content", true)
        // .attr("width", width + margin.left + margin.right)
        // .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Scale the range of the data
    x.domain([1, 10]);
    y.domain([0, 100]);

    // Add the valueline path.
    svg.append("path")
        .attr("class", "line")
        .attr("id", "no-switch-line")
        .attr("d", valueline(data));
    
    svg.append("path")
        .attr("class", "line")
        .attr("id", "switch-line")
        .attr("d", valueline(data))

    // Add the X Axis
    svg.append("g")	
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    // Add the Y Axis
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

