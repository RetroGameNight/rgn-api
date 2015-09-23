export default {
  models: {
    Challenge: {
      id: "Challenge",
      properties: {
        id: {
          description: "id of trial",
          type: "string",
        },
        trial: {
          description: "Name of trial",
          type: "string",
        },
        issuer: {
          description: "Name of issuer",
          type: "string",
        },
        player: {
          description: "Name of player",
          type: "string",
        },
        challengeStatus: {
          description: "status of the Challenge",
          type: "string",
          enum: [
            "Pending",
          ]
        },
        createdAt: {
          description: "time challenge was created",
          type: "date",
        },
        lastUpdated: {
          description: "time challenge last updated",
          type: "date",
        },
      }
    },
    Event: {
      id: 'Event',
      properties: {
        id: {
          description: "id of event",
          type: "string",
        },
        name: {
          description: "name of event",
          type: "string",
        },
        owner: {
          description: "owner of event",
          type: "string",
        },
        startTime: {
          description: "start time of event",
          type: "date",
        },
        endTime: {
          description: "end time of event",
          type: "date",
        },
        avatarURL: {
          description: "url to avatar",
          type: "string",
        },
        type: {
          description: "type of event",
          type: "string",
        },
        lastUpdated: {
          description: "time event was last updated",
          type: "date",
        },
      }
    },
    Game: {
      id: 'Game',
      properties: {
        id: {
          description: "id of game",
          type: "string",
        },
        name: {
          description: "name of the game",
          type: "string",
        },
        system: {
          description: "name of the system the is on game",
          type: "string",
        },
        avatarURL: {
          description: "url of the game's avatar",
          type: "string",
        },
        createdAt: {
          description: "the time the game object was created",
          type: "date",
        },
        lastUpdated: {
          description: "the time the game object was last updated",
          type: "date",
        },
      }
    },
    Score: {
      id: 'Score',
      properties: {
        id: {
          description: "id of score",
          type: "string",
        },
        player: {
          description: "The player that achived the score",
          type: "string",
        },
        issuer: {
          description: "The user created the score",
          type: "string",
        },
        trial: {
          description: "the trial this score relates to",
          type: "string",
        },
        createdAt: {
          description: "the time the score object was created",
          type: "date",
        },
        lastUpdated: {
          description: "the time the score object was last updated",
          type: "date",
        },
      }
    },
    Trial: {
      id: 'Trial',
      properties: {
        id: {
          description: "id of trial",
          type: "string",
        },
        name: {
          description: "name of the trial",
          type: "string",
        },
        game: {
          description: "the id of game object this trial relates to",
          type: "string",
        },
        type: {
          description: "The type of the trial",
          type: "string",
        },
        description: {
          description: "The description of the trial",
          type: "string",
        },
        creator: {
          description: "The id of the user who created the trial",
          type: "string",
        },
        createdAt: {
          description: "the time the score object was created",
          type: "date",
        },
        lastUpdated: {
          description: "the time the score object was last updated",
          type: "date",
        },
      }
    },
    User: {
      id: 'User',
      properties: {
        id: {
          description: "id of user",
          type: "string",
        },
        name: {
          description: "name of the trial",
          type: "string",
        },
        email: {
          description: "the id of game object this trial relates to",
          type: "string",
        },
        type: {
          description: "The type of the trial",
          type: "string",
        },
        avatarURL: {
          description: "The description of the trial",
          type: "string",
        },
        createdAt: {
          description: "the time the score object was created",
          type: "date",
        },
        lastUpdated: {
          description: "the time the score object was last updated",
          type: "date",
        },
      }
    },
  }
}
