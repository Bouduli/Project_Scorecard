//Players object 
const players = JSON.parse(localStorage.getItem("players")) || {};

//This is black magic fuckery to display players collected from localStorage. 
Object.keys(players).forEach(p=>displayPlayer(p));


let court = [];
//Fetch the game court... 
loadCourt(5);
async function loadCourt(count = 18){
    try {
        //Works as intended... for now. 
        let response = await fetch("info.json");
        const courtData = await response.json();
        
        //Takes a slice out of the court in order to have shorter games. 
        court = courtData.court.slice(0,count);
        console.log(`Court loaded with: ${count} stages...`);
    } catch (error) {
        console.log(error   );
    }

    
}

//Functionality for RegisterForm to be able to register a player. 
document.getElementById("RegisterForm").addEventListener("submit", (e)=>registerPlayer(e));
function registerPlayer(e){
    //Prevents the forms usual get-request.
    e.preventDefault();

    //Name that is collected from the form.  
    const name = e.target.playerName.value.trim();
    
    //After the name is collected, the input is cleared.
    e.target.playerName.value = ""; 

    //If the name is empty or was full of whitespace characters (removed by trim) - the function should return
    //as we don't wan't player names to be empty. 
    if(!name) return;

    //if there is a player with that same name - the function should return as we don't want
    //players with duplicate names
    if (players[name]) return;

    //if there is a name that isn't duplicated - the player is added to the player object. 
    players[name] = {};

    //we also save to localStorage. 
    persistToLocalStorage();
 
    //Finally a player is rendered with displayPlayer function. 
    displayPlayer(name);
}

//Functionality to save to localStorage. 
function persistToLocalStorage(){
    if(!Object.keys(players).length) return localStorage.clear();
    localStorage.setItem("players", JSON.stringify(players));

}

//Functionality to display a player - Used either when a player is loaded from localStorage, or when created 
//through the 'registerForm' 
function displayPlayer(name){
    //If the name somehow is empty - which it shouldn't be without user tampering in console
    //or in localstorage - the function will return. (we dont render invisible players around here...)
    if(name =="") return;

    //Tries to find the div where names would be displayed
    let NameWrapper = document.querySelector("#NameWrapper");
    //If such a div cannot be found, the div and it's content is created and displayed. 
    if(!NameWrapper) {
        //Div to hold the names of registered players. 
        NameWrapper = document.createElement("div");
        NameWrapper.id="NameWrapper";
        document.querySelector("#Start").appendChild(NameWrapper);

        //Header to tell a user what the names below are. 
        let h2 = document.createElement("h2");
        h2.innerText = "Players added to game:";
        NameWrapper.appendChild(h2);

        //Button to start the game is also shown. 
        let button = document.createElement("button");
        button.id = "StartButton"
        button.innerText = "Start Game!!";

        //StartGame is defined below registerPlayer.
        button.addEventListener("click", startGame);
        NameWrapper.appendChild(button);
    } 

    //DISPLAYING THE NAMES

    //Wrapper div to contain the NAME and deletebutton for a player. 
    let nameDiv = document.createElement("div"); 
    nameDiv.classList.add("nameDiv");
    NameWrapper.appendChild(nameDiv); 

    //Displays the names of registered players. 
    let displayName = document.createElement("p");
    displayName.innerText = name;
    nameDiv.appendChild(displayName);

    //Displays a button to remove a registered player. 
    let button = document.createElement("button");
    button.innerText="Remove";
    nameDiv.appendChild(button); 

    //When a player is removed - they are removed from the player object, localstorage and from the display. 
    button.addEventListener("click", ()=>{ //REMOVEPLAYER
        //removing from display
        nameDiv.remove(); //nameDiv

        //Removing from the player object
        delete players[name];

        //removed from localstorage due to this save. 
        persistToLocalStorage();

        /*When the last player is removed then the div contianing 
        the names is removed (along with the button to start a game). */
        if(!Object.keys(players).length){
            document.querySelector("#NameWrapper").remove();
        }
    });


    //END OF DISPLAYPLAYER FUNCTION

}

// function that is run when game is started with the startGame Button.
function startGame(ev){
    /*Since the function can be called by a user with the console to prevent unintentional use
    Event.isTrusted is checked, an event created through console by a user has the property iTrusted=false. 
    Starting the game by other means than the button would lead to weird behaviour - therefore this if-statement prevents it. */
    if(!ev.isTrusted) return console.error("Please add a player and press the button again");

    //If there are no players present, the code will exit and the game is not started
    if(!Object.keys(players).length) return console.error("There are no players");

    //Removes the start menu - as it's obsolete when the game has begun. 
    document.getElementById("Start").remove();

    //Renders the visual element for each stage. 
    court.forEach(stage => renderStage(stage));

    //Displays a button to end the game. 
    let endButton = document.createElement("button");
    endButton.innerText="End Game";
    endButton.id ="EndButton"
    document.querySelector("#StageWrapper").appendChild(endButton);
    

    //Button to end the game - endGame function provides necessary logic to end the game safely 
    //and to display the resuls from the game. 
    endButton.addEventListener("click", endGame);
    
    
}
//Renders the visual element of each stage and defines behaviour of input elements. 
function renderStage(stage){
    
    /*Inspecting the JSON collected for the court - it shows that every stage has a id, par value
    and related info. If such is not provided in the stage, then it is incorrectly configured - thus 
    the code errors in console. */
    if(!stage.id || !stage.par || !stage.info)return console.error(`The stage was incorrectly configured - Stage: ${stage}`);

    //A wrapper div for the stage elements, StageWrapper,  is created if such a div cannot be found. 
    let StageWrapper = document.getElementById("StageWrapper");
    if(!StageWrapper){
        
        StageWrapper = document.createElement("div");
        StageWrapper.id = "StageWrapper";
        document.body.appendChild(StageWrapper);
    }
    /*A div for a single stage is created, a class to be css:ed is added, and is 
    then added to the StageWrapper*/
    const stageDiv = document.createElement("div");
    stageDiv.classList.add("stageDiv");
    StageWrapper.appendChild(stageDiv);

    //Stage number and par-value
    let h3 = document.createElement("h3");
    h3.innerText = `# ${stage.id} - Par: ${stage.par}`;
    h3.classList.add("stageHeading")
    stageDiv.appendChild(h3);

    //Stage info
    let info = document.createElement("i");
    info.innerText = "Requirements: " + stage.info;
    stageDiv.appendChild(info);
    
    //Break tag to make some space between the stage info and scoreboard.
    stageDiv.appendChild(document.createElement("br"));

    
    //Div for scoreboards 
    let scoreboard = document.createElement("div");
    scoreboard.classList.add("scoreboard");
    stageDiv.appendChild(scoreboard);

    //Individual score elements for every player
    for(let p in players){
        
        //scoreDiv
        let scoreDiv = document.createElement("div");
        scoreDiv.classList.add("scoreDiv");
        scoreboard.appendChild(scoreDiv);


        // playerName
        let playerName = document.createElement("p");
        playerName.innerText = p;
        scoreDiv.appendChild(playerName);

        //score input element
        let score = document.createElement("input");
        score.type = "number";
        score.min = "1";
        score.required = true;
        score.placeholder = "Enter score";
        scoreDiv.appendChild(score);

        //if the score is changed - relevant logic for calculating totalscore and saving to localStorage
        //is performed in scoreChanged function. 
        score.addEventListener("change",(e)=>scoreChanged(e,p, stage));

        //If there already is a score (which would be loaded from localStorage.) then it is displayed as the value. 
        if(p[stage.id]){
            score.value = players[p][stage.id];
        }

        //Adds a simple break tag to make som easy space between inputs. 
        scoreDiv.appendChild(document.createElement("br"));

    }
}
//Fired when score is changed. e: event, p: player. 
function scoreChanged(e, p, stage){
    //Upon changing the score in the input field, it should be reflected
    //on the related player object. 
    if(!e.target.value) e.target.value = 1;

    players[p][stage.id] = e.target.value;

    //Calculating the total score is performed here
    players[p]['score'] = 0; 
    court.forEach(stage=>players[p]['score']+= parseInt(players[p][stage.id]));
    persistToLocalStorage();

}

//Function to perform logic to see if the game is supposed to be ending - afterwards it will display the leaderBoards 
function endGame(ev){

    //If event isn't trusted - it means that a user probably is running the function from console.
    if(!ev.isTrusted) return console.error("Run the function from the button - don't try doing what you are doing")

    //keys of all the players - reused several times therefore a const var early. 
    const KEYS = Object.keys(players);

    //bool to see wether or not we are ending the game.
    let endingGame = true;
    

    //if there are no player keys somehow - the game cannot end as there are no players. 
    if (!KEYS.length) return console.error("no players - can't end game");

    //We are looping over the keys for each player, and for each stage - in order to determine if all players
    /*Have inputted a score on each of the stages. This has two reasons for which - expand this comment block. 
        No.1 - If a player hasn't scored on each hole - then the game isn't finished - trying to finish before
               each player has scored would give the player an advantage (if their score is regarded as zero or one.)
        No. 2 - If a player hasn't scored on each hole - or more importantly, if their score is an empty string from 
                the input element - their calculated score would be NaN, as it's trying to calculate (number + 'empty string') as an integer. 
                */

    //If endingGame bool becomes therefore both forEach loops should return false. If both forEach's complete successfully - the bool should be true. 
    let lastStageScoredByPlayer = 0;
    KEYS.forEach(player => {
        const stagesScored = findLastStageScored(player)-1;
        console.log(stagesScored);
        if(stagesScored<lastStageScoredByPlayer || !lastStageScoredByPlayer) lastStageScoredByPlayer = stagesScored;});
        console.log(lastStageScoredByPlayer);
    
    console.log("All players have scored until " + lastStageScoredByPlayer);
    const NEWCOURT = court.slice(0,lastStageScoredByPlayer);
    console.log(NEWCOURT);
    return; 
    //If we are not ending the game - function is returned with a console error
    if(!endingGame)return console.error("All players hasn't scored correctly on each stage - can't end game");
    
    //Individual stage info is removed
    document.querySelector("#StageWrapper").remove();

    //a leaderboard div is created and a heading for it. 
    let leaderboard = document.createElement("div");
    leaderboard.id = "leaderboard";
    document.body.appendChild(leaderboard);


    let h1 = document.createElement("h1");
    h1.innerText="Leaderboard";
    leaderboard.appendChild(h1);


    //The players are sorted with KEYS.toSorted(...) which returns an array of the player keys
    //sorted by their scores in ascending order (Lowest score first).
    let sortedPlayers = KEYS.toSorted((a,b)=>{
        let _a = parseInt(players[a]['score']);
        let _b = parseInt(players[b]['score']);

        //console.log(`Keys are: ${a} and ${b} - ` + "a: " + _a + " b: " + _b + " -- a-b equals: " + (_a-_b));
        return _a-_b;
    });
    console.log(sortedPlayers);
    
    //The array of sorted 'player keys' is looped over to display the leaderboard in correct order. 
    sortedPlayers.forEach(name=>{
        
    
        // diaplays name and score for each player
        let nameWrapper = document.createElement("div");
        nameWrapper.classList.add("nameWrapper");
        leaderboard.appendChild(nameWrapper);

        
        let displayName = document.createElement("p");
        displayName.innerText = name;
        nameWrapper.appendChild(displayName);

        let score = document.createElement("i");
        score.innerText= players[name]['score'];
        nameWrapper.appendChild(score);
    });

}
//This function should return the index of the last stage a player has scored - as it will be used
// to display the leaderboard at that stage. 
function findLastStageScored(player){
    let lastStage = 0;

    /*This might look funny - therefore below is an explanation of the issue. 
        I want to know which is the last stage a player has correctly scored. 
        To do this - i loop over each stage in court - and sees if there is a key-value-pair
        for the player on that stage. If there isn't - i want to stop the forEach loop, and 
    */
   for(let i = 0; i<court.length; i++){
    lastStage = court[i].id;
    if(!players[player][court[i].id])break;
   }
    // try {
    //     court.forEach(stage =>{
    //         lastStage = stage.id;
    //         if(!players[player][stage.id])  throw "fuck this";
    //     });
    // } catch (error) {
    // }

    return lastStage;
}


