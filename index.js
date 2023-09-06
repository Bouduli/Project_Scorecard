//Players object 
const players = JSON.parse(localStorage.getItem("players")) || {};

//This is black magic fuckery to display players collected from localStorage. 
Object.keys(players).forEach(p=>displayPlayer(p));


let court = [];
//Fetch the game court... 
loadCourt(4);
async function loadCourt(count = 18){
    try {
        //Works as intended... for now. 
        let response = await fetch("https://fpgscore.fredricpersson2.repl.co/info.json");
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
        if(!Object.keys(players).length) document.querySelector("#NameWrapper").remove();
    });


    //END OF DISPLAYPLAYER FUNCTION

}

//TODO TODO TODO TODO
// function that is run when game is started with the startGame Button.

function startGame(ev){
    /*Since the function can be called by a user with the console to prevent unintentional use
    Event.isTrusted is checked, as a modified event being sent into the function would cause it to 
    run otherwhise - which is sub optimal. Using encapsulation would be preferential. 
    */
    if(!ev.isTrusted) return console.error("Please add a player and press the button again");

    //If there are no players present, the code will exit and the game is not started 
    //- however this should not occur through regular usage. 
    if(!Object.keys(players).length) return console.error("There are no players");

    //Remove start menu
    document.getElementById("Start").remove();

    //Renders the visual element for each stage. 
    court.forEach(stage => renderStage(stage));

    //Displays a button to end the game. 
    let endButton = document.createElement("button");
    endButton.innerText="End Game";
    endButton.id ="EndButton"
    document.querySelector("#StageWrapper").appendChild(endButton);
    

    //Checks are performed to make sure that every player has a registered score for each stage. 
    endButton.addEventListener("click", ()=>{
        //Bool that is used to determine wether or not the game is actually complete or not. 
        let gameIsComplete = true;

        /* Each players score is checked to make sure they have scored each stage (which otherwise would)
        Affect the scores to an unfair advantage (if the score calculates that is - most of the time it)
        becomes "NaN". */
        Object.keys(players).forEach(p => {
            if(!Object.keys(players[p]).length) return gameIsComplete = false;
            gameIsComplete=playerHasScored(players[p]);
            
            //Because i don't want to keep track of which player hasn't scored correctly - the loop over players is interrupted as gameIsComplete should be false. 
            if(!gameIsComplete) return;
        });
        
        //If the game isn't complete, this errors to console for now. 
        if(!gameIsComplete)return console.error("All players hasn't scored correctly on each stage");

        //If we reach this else block, then we know for sure that the game is finished and that each player has scored correctly. 
        else {
            endGame();
        }
    });
    
    
}


//Functionality to add the score of a particular hole to a player.  
function addScore(name, hole, score){
    players[name][hole] = score;

}




function playerHasScored(player){
    let playerHasScoredCorrectly = true;
    court.forEach(stage=>{
    
        //console.log(player[stage.id]);
        

        if(!player[stage.id]) return gameIsComplete = false;      
    });
    //console.log("Player has scored: " + playerHasScoredCorrectly)
    return playerHasScoredCorrectly;
    
}

//Renders the visual element of each stage and defines behaviour of input elements. 
function renderStage(stage){
    
    /*Inspecting the JSON collected for the court - it shows that every stage has a id, par value
    and related info. If such is not provided in the stage, then it is incorrectly configured - thus 
    the code errors in console. */
    if(!stage.id || !stage.par || !stage.info)return console.error(`The stage was incorrectly configured - Stage: ${stage}`);

    //A wrapper div for the stage elements are created if such a div cannot be found. 
    if(!document.getElementById("StageWrapper")){
        
        let stageWrapperDiv = document.createElement("div");
        stageWrapperDiv.id = "StageWrapper";
        document.body.appendChild(stageWrapperDiv);
    }

    /*A div for a single stage is created, a class to be css:ed is added, and is 
    then added to the StageWrapper*/
    const stageDiv = document.createElement("div");
    stageDiv.classList.add("stageDiv");
    document.getElementById("StageWrapper").appendChild(stageDiv);

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

        //score
        let score = document.createElement("input");
        score.type = "number";
        score.min = "1";
        score.required = true;
        score.placeholder = "Enter score";

        //If there is a score saved in local storage - it is automatically filled to the input element
        if(p[stage.id]){
            score.value = players[p][stage.id];
        }

        score.addEventListener("change",(e)=>scoreChanged(e,p, stage));
        scoreDiv.appendChild(score);
        scoreDiv.appendChild(document.createElement("br"));

    }
}
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

//Displays a leaderboard. 
function endGame(){
    //Individual stage info is removed
    document.querySelector("#StageWrapper").remove();

    //a leaderboard div is created and a heading for it. 
    let leaderboard = document.createElement("div");
    leaderboard.id = "leaderboard";
    document.body.appendChild(leaderboard);


    let h1 = document.createElement("h1");
    h1.innerText="Leaderboard";
    leaderboard.appendChild(h1);


    //The players are sorted with Object.keys(...).toSorted(...) which returns an array of the player keys
    //sorted by their scores in ascending order (Lowest score first).
    let sortedPlayers = Object.keys(players).toSorted((a,b)=>{
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
function persistToLocalStorage(){
    if(!Object.keys(players).length) return localStorage.clear();
    localStorage.setItem("players", JSON.stringify(players));

}

