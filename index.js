//Players object 
const players = JSON.parse(localStorage.getItem("players")) || {};

//This is black magic fuckery to display players collected from localStorage. 
Object.keys(players).forEach(p=>{
    if(p=="") return;
    addPlayer(p);
});
let court = [];

//Fetch the game court... 
loadCourt(4);
async function loadCourt(count = 14){
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

//Functionality for adding a player. To be used with Eventlistener. 
function addPlayer(name){
    //The player is added to the player object, which is also saved in localStorage. 
    if (!players[name]) players[name] = {};
    persistToLocalStorage();

    //
    //DISPLAYING NAMES OF PLAYERS
    //

    //Tries to find the div where names would be displayed
    let nameDiv = document.querySelector("#Start .nameDiv");
    //If such a div cannot be found, it and it's content is displayed
    if(!nameDiv) {
        //Div to hold the names of registered players. 
        nameDiv = document.createElement("div");
        nameDiv.classList.add("nameDiv");
        document.querySelector("#Start").appendChild(nameDiv);

        //Header to tell a user what the names below are. 
        let h2 = document.createElement("h2");
        h2.innerText = "Players added to game:";
        nameDiv.appendChild(h2);

        //Button to start the game is also shown. 
        let button = document.createElement("button");
        button.id = "StartButton"
        button.innerText = "Start Game!!";
        button.addEventListener("click", startGame);
        nameDiv.appendChild(button);
    } 

    //THE NAMES

    //Wrapper div to contain the NAME and deletebutton for a player. 
    let nameWrapper = document.createElement("div");
    nameWrapper.classList.add("nameWrapper");
    nameDiv.appendChild(nameWrapper);

    //Displays the names of registered players. 
    let displayName = document.createElement("p");
    displayName.innerText = name;
    nameWrapper.appendChild(displayName);

    //Displays a button to remove a registered player. 
    let button = document.createElement("button");
    button.innerText="Remove";
    nameWrapper.appendChild(button);
    //When a player is removed - they are removed from the player object and from the display. 
    button.addEventListener("click", ()=>{
        //removing from display
        nameWrapper.remove();

        //Removing from the player object
        delete players[name];

        //Changes are made to the player object - thus a save to localStorage is performed.
        persistToLocalStorage();

        /*When the last player is removed then the div contianing 
        the names is removed (along with the button to start a game). */

        if(!Object.keys(players).length) document.querySelector(".nameDiv").remove();
    });


}

//Functionality to add the score of a particular hole to a player.  
function addScore(name, hole, score){
    players[name][hole] = score;

}

//Function that eventually calls addPlayer() after input validation has taken place. 
document.getElementById("registerForm").addEventListener("submit", (e)=>{
    //Prevents the forms usual get-request.
    e.preventDefault();

    //Name that is collected from the form.  
    const name = e.target.playerName.value.trim();
    
    //After the name is collected, the input is cleared.
    e.target.playerName.value = ""; 

    //If the name is empty or was full of whitespace characters (removed by trim) - the function will return. 
    if(!name) return;

    addPlayer(name);
});

// function that is run when game is started with the startGame Button.

function startGame(ev){
    /*Since the function can be called by a user with the console to prevent unintentional use
    Event.isTrusted is checked, as a modified event being sent into the function would cause it to 
    run otherwhise - which is sub optimal. Using encapsulation would be preferential. 
    */
    if(!ev.isTrusted) return console.error("Please add a player and press the button again");
    if(!Object.keys(players).length) return console.error("There are no players");

    //Remove start menu
    document.getElementById("Start").remove();
    court.forEach(stage => renderStage(stage));

    
}

//Renders the visual element of each stage. 
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
        score.placeholder = "Enter score";

        //If there is a score saved in local storage - it is automatically filled to the input element
        if(p[stage.id]){
            score.value = players[p][stage.id];
        }

        score.addEventListener("change", (e)=>{
            players[p][stage.id] = e.target.value;
            console.log(players[p]);
            players[p]['score'] = 0; 
            court.forEach(stage=>players[p]['score']+= parseInt(players[p][stage.id]));
            console.log(players[p]);
            
            /*CALCULATE TOTAL SCORE  HERE HERE HERE HERE HERE HERE HERE HERE HERE HERE  HERE HERE HERE HERE HERE HERE HERE HERE HERE HERE 
             HERE HERE HERE HERE HERE HERE HERE HERE HERE HERE  HERE HERE HERE HERE HERE HERE HERE HERE HERE HERE  HERE HERE HERE HERE HERE HERE HERE HERE HERE HERE 
              HERE HERE HERE HERE HERE HERE HERE HERE HERE HERE 
               HERE HERE HERE HERE HERE HERE HERE HERE HERE HERE 
                HERE HERE HERE HERE HERE HERE HERE HERE HERE HERE  HERE HERE HERE HERE HERE HERE HERE HERE HERE HERE  HERE HERE HERE HERE HERE HERE HERE HERE HERE HERE  HERE HERE HERE HERE HERE HERE HERE HERE HERE HERE  HERE HERE HERE HERE HERE HERE HERE HERE HERE HERE 
                 HERE HERE HERE HERE HERE HERE HERE HERE HERE HERE 
                  HERE HERE HERE HERE HERE HERE HERE HERE HERE HERE 
                   HERE HERE HERE HERE HERE HERE HERE HERE HERE HERE 
                    HERE HERE HERE HERE HERE HERE HERE HERE HERE HERE 
                     HERE HERE HERE HERE HERE HERE HERE HERE HERE HERE 
                      HERE HERE HERE HERE HERE HERE HERE HERE HERE HERE 
                       HERE HERE HERE HERE HERE HERE HERE HERE HERE HERE  HERE HERE HERE HERE HERE HERE HERE HERE HERE HERE  HERE HERE HERE HERE HERE HERE HERE HERE HERE HERE  HERE HERE HERE HERE HERE HERE HERE HERE HERE HERE 
                        HERE HERE HERE HERE HERE HERE HERE HERE HERE HERE 
                         HERE HERE HERE HERE HERE HERE HERE HERE HERE HERE  HERE HERE HERE HERE HERE HERE HERE HERE HERE HERE  HERE HERE HERE HERE HERE HERE HERE HERE HERE HERE  HERE HERE HERE HERE HERE HERE HERE HERE HERE HERE 
                          HERE HERE HERE HERE HERE HERE HERE HERE HERE HERE 
                          
             */
            persistToLocalStorage();

        });
        scoreDiv.appendChild(score);
        scoreDiv.appendChild(document.createElement("br"));

    }    
}

function persistToLocalStorage(){
    if(!Object.keys(players).length) return localStorage.clear();
    localStorage.setItem("players", JSON.stringify(players));

}

