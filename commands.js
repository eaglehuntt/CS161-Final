const calls = require("./api_calls.json");
const secrets = require("./secrets.json");
const readline = require("readline");
const clipboard = require("clipboardy");

class GameStateCommands {
  constructor() {
    this.getFactionInfo(); // Call the method in the constructor
  }
  static #factionHeader = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${secrets.apiKey}`,
    },
  };

  factionInfo = {
    names: [],
    symbol: [],
    description: [],
  };

  getFactionInfo = () => {
    fetch(calls.factions, GameStateCommands.#factionHeader)
      .then((response) => response.json())
      .then((response) => {
        for (let i = 0; i < response.data.length; i++) {
          this.factionInfo.names[i] = response.data[i].name;
          this.factionInfo.symbol[i] = response.data[i].symbol;
          this.factionInfo.description[i] = response.data[i].description;
        }
      })
      .catch((err) => console.error(err));
  };

  displayFactions = () => {
    for (let i = 0; i < this.factionInfo.names.length; i++) {
      console.log(`${i}: ${this.factionInfo.names[i]}`);
    }
  };

  #getAgentSign = () => {
    return new Promise((resolve) => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      rl.question("Enter your Agent Sign: ", (sign) => {
        rl.close(); // Close the interface
        resolve(sign);
      });
    });
  };

  #getAgentFaction = () => {
    return new Promise((resolve) => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      rl.question(
        `\nEnter the faction's number (0-${
          this.factionInfo.names.length - 1
        }): `,
        (faction) => {
          rl.close(); // Close the interface
          resolve(faction);
        }
      );
    });
  };

  validateRegister = async (info) => {
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(info),
    };

    try {
      const response = await fetch(calls.registerUser, options);
      const data = await response.json();

      if (data.error) {
        console.log(data.error.data.symbol[0]);
        return false;
      } else {
        console.log(
          `Registered! Here is your access token. It has been copied to your clipboard\n${data.data.token}\n`
        );
        clipboard.writeSync(data.data.token);
        return true;
      }
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  register = async () => {
    let info = {
      symbol: "",
      faction: "",
    };

    const symbol = await this.#getAgentSign();
    info.symbol = symbol;

    console.log(`Welcome, ${symbol}`);
    console.log("It is now time to join a faction. Choose wisely.\n");

    this.displayFactions();

    let validFactionSelected = false;

    while (!validFactionSelected) {
      let factionNumber = await this.#getAgentFaction();
      factionNumber = parseInt(factionNumber);

      if (factionNumber <= this.factionInfo.names.length - 1) {
        info.faction = this.factionInfo.symbol[factionNumber];

        let registered = false;

        while (!registered) {
          registered = await this.validateRegister(info);

          if (!registered) {
            info.symbol = await this.#getAgentSign();
          } else {
            break; // Break the loop when registration is successful
          }
        }

        validFactionSelected = true;
      } else {
        console.log("Incorrect input. Please enter a listed faction.");
      }
    }
  };

  login = () => {
    /* continue */
  };
}

const game = new GameStateCommands();

game.register();
