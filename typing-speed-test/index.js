// Speed = Distance / Time
// Speed = Words / Time

const readline = require('node:readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const phrase = "The quick brown fox jumps over the lazy dog";
let time = 0;

console.log("Welcome to the typing speed test.");
console.log("--------------------------------");
console.log("\nType the text below as fast as you can:\n\n")
console.log(phrase);

async function readWords() {
    let timerId = setInterval(() => {time++}, 1000);

    rl.question('', word => {
      if (word != phrase) {
        console.log("Please type in the phrase as it is\n");
        console.log(`Phrase => ${phrase}`);
        console.log(`What you typed => ${word}`);
        running = false;
        process.exit(0);
      }

      console.log("\nDone.");
      console.log("Computing speed (this is an approximation)...\n");
      clearInterval(timerId);

      console.log(`Your typing speed is approximately ${Math.floor(phrase.length/time)} words per second.\n`);
      process.exit(0);
    });
}

readWords();