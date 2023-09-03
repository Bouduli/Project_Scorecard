//Players object 
const players = {};
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
    if (players[name]) return console.error("name is already present")
    players[name] = {};


    //DISPLAYING NAMES OF PLAYERS
    let nameDiv = document.querySelector("#Start div");

    //Displays a header for registered players AND the button to start a game
    if(!nameDiv.childElementCount) {
        nameDiv.classList.add("nameDiv");
        //The header isn't shown due to possible confusion 
        let h2 = document.createElement("h2");
        h2.innerText = "Players added to game:";
        nameDiv.appendChild(h2);


        let button = document.createElement("button");
        button.innerText = "Start Game!!";
        button.addEventListener("click", startGame);
        nameDiv.appendChild(button);
    } 

    //Displays the names of registered players. 
    let displayName = document.createElement("p");
    displayName.innerText = name;
    nameDiv.appendChild(displayName);


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
    if(!ev.isTrusted) return Error("Please add a player and use the button that appears instead...");

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
        score.addEventListener("change", (e)=>{
            players[p][stage.id] = e.target.value;
            console.log(players[p]);
            //players[p]["score"] = calcPlayerTotal(p);
            
        });
        scoreDiv.appendChild(score);
        scoreDiv.appendChild(document.createElement("br"));

    }



    

    
}
function calcPlayerTotal(_p){
    let scores = {};
    let totalScore=0;
    console.log(court);
    court.forEach(c=>scores[c.id]=_p[c.id]);
    for(let s in scores){
        totalScore += scores[s];
    }
    console.log(totalScore);
    
    
}




