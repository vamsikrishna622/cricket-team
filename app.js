const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "cricketTeam.db");

const app = express();
app.use(express.json());

let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server beginning https://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    SELECT *
    FROM
    cricket_team;
    `;
  const playersList = await db.all(getPlayersQuery);
  const convertDbObjectToResponseObject = (playersList) => {
    let allPlayersList = [];
    for (eachPlayer of playersList) {
      const playerObject = {
        playerId: eachPlayer.player_id,
        playerName: eachPlayer.player_name,
        jerseyNumber: eachPlayer.jersey_number,
        role: eachPlayer.role,
      };
      allPlayersList.push(playerObject);
    }
    return allPlayersList;
  };
  response.send(convertDbObjectToResponseObject(playersList));
});

//API 2

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const convertRequestObjectToDBObject = (playerDetails) => {
    return {
      player_name: playerDetails.playerName,
      jersey_number: playerDetails.jerseyNumber,
      role: playerDetails.role,
    };
  };

  const playerDBObject = convertRequestObjectToDBObject(playerDetails);
  const { player_name, jersey_number, role } = playerDBObject;
  const addPlayerQuery = `
    INSERT INTO 
    cricket_team(player_name, jersey_number, role)
    VALUES(
       "${player_name}",
       ${jersey_number},
       "${role}"
    );`;
  const dbResponse = await db.run(addPlayerQuery);
  const playerId = dbResponse.lastID;
  response.send("Player Added to Team");
});

//API 4
app.get("/players/:playerId/", async (request, response) => {
  let { playerId } = request.params;
  playerId = parseInt(playerId);
  const getPlayerQuery = `
  SELECT *
  FROM 
    cricket_team
  WHERE 
  player_id = ${playerId};`;
  const dbObject = await db.get(getPlayerQuery);
  const convertDBObjectToResponseObject = (dbObject) => {
    return {
      playerId: dbObject.player_id,
      playerName: dbObject.player_name,
      jerseyNumber: dbObject.jersey_number,
      role: dbObject.role,
    };
  };
  const player = convertDBObjectToResponseObject(dbObject);
  response.send(player);
});

//API 4
app.put("/players/:playerId", async (request, response) => {
  let { playerId } = request.params;
  playerId = parseInt(playerId);
  let playerDetails = request.body;

  const { playerName, jerseyNumber, role } = playerDetails;

  const updatePlayerQuery = `
  UPDATE
  cricket_team
  SET
  player_name= '${playerName}',
  jersey_number= ${jerseyNumber},
  role= '${role}'
  WHERE 
  player_id = ${playerId};
  `;
  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

// API 5
app.delete("/players/:playerId/", async (request, response) => {
  let { playerId } = request.params;
  playerId = parseInt(playerId);
  const deletePlayerQuery = `
    DELETE FROM
    cricket_team
    WHERE 
    player_id = ${playerId};
    `;
  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
