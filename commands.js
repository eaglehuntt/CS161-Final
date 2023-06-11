const calls = require("./api_calls.json");
const secrets = require("./secrets.json");
const readline = require("readline");

class GameStateCommands {
  static #factionHeader = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${secrets.apiKey}`,
    },
  };

  static factionInfo = {
    names: [],
    symbol: [],
    description: [],
  };

  static getFactionInfo = () => {
    fetch(calls.factions, this.#factionHeader)
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

  static displayFactions = () => {
    for (let i = 0; i < this.factionInfo.names.length; i++) {
      console.log(`${i}: ${this.factionInfo.names[i]}`);
    }
  };

  static #getAgentSign = () => {
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

  static #getAgentFaction = () => {
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

  static register = async () => {
    let info = {
      symbol: "",
      faction: "",
    };

    info.symbol = await this.#getAgentSign();

    console.log(`Welcome, ${info.symbol}`);
    console.log("It is now time to join a faction. Choose wisely.\n");

    this.displayFactions();

    let confirm = false;

    while (!confirm) {
      let faction = await this.#getAgentFaction();

      if (faction <= this.factionInfo.names.length - 1) {
      } else {
        console.log("Incorrect input. Please enter a correct faction.");
      }
    }
  };
}

GameStateCommands.getFactionInfo();
GameStateCommands.register();
