#!/usr/bin/env node

const readline = require('node:readline');
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const date = new Date();

let day = date.getDate();
day = day < 10 ? `0${day}` : day;
let month = date.getMonth() + 1;
month = month < 10 ? `0${month}` : month;
const year = date.getFullYear();
const formatted_date = `${day}-${month}-${year}`;

const filepath = path.join(__dirname, 'tasks', '001.txt');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('--------------------Task Manager 1.0--------------------');
console.log('Choose an option:');
console.log('a - Add task');
console.log('m - Mark done');
console.log('v - View todays tasks or specify a date');
console.log('q - Quit Program');
console.log("---------------------------------------------------------");

function init() {
  rl.question('', (user_input) => {
    if (user_input == 'a') {
      console.log('Enter tasks to accomplish today: (q to quit)');
      createTask();
    }
    else if (user_input == 'v') viewTasks();
    else if (user_input == 'm') markDone();
    else if (user_input == 'q') process.exit(0);
    else {
      console.log(`Error: Invalid input\nValid Params: a - add task, v - view tasks, q - quit program`);
      rl.close();
    }
  });
}

function createTask() {
  rl.question('> ', user_input => {
    if (user_input == 'q') {
      rl.close();
    }

    writeTasks(user_input);
  });
}

async function writeTasks(task) {
  try {
    await fsPromises.mkdir(path.join(__dirname, 'tasks'), { recursive: true });

    if (!fs.existsSync(filepath)) {
      const file_info = `${formatted_date}\n------------\nStatus | Task\n---------------`;
      await fsPromises.writeFile(filepath, file_info);

      await fsPromises.writeFile(filepath, `  0    | 1. ${task}`);
    }
    else {
      const readStream = fs.createReadStream(filepath, { encoding: 'utf-8' });

      for await (const chunk of readStream) {
        const count = chunk.split('\n').length + 1;
        // const splitString = chunk.split('.');

        await fsPromises.appendFile(filepath, `\n  0    | ${count}. ${task}`);
      }
    }

    createTask();
  }
  catch (err) {
    console.error(err);
  }
}

const search_task_file = search_task_date => {
  if (fs.existsSync(path.join(__dirname, 'tasks'))) {
    if (fs.existsSync(path.join(__dirname, 'tasks', `${search_task_date}.txt`))) {
      return [true, path.join(__dirname, 'tasks', `${search_task_date}.txt`)];
    }
    else {
      return [false, `Sorry, there are no tasks dated "${search_task_date}".`];
    }
  }
  else {
    console.log('Sorry, no tasks available. Create some and come back later...');
    rl.close();
  }
}

async function viewTasks() {
  let search_task_date;
  let task_file_path;

  rl.question('Specify a date in the format dd-mm-yyyy (or press enter for today): ', user_input => {

    if (user_input) search_task_date = user_input;
    else search_task_date = `${day}-${month}-${year}`;

    task_file_path = search_task_file(search_task_date);

    if (task_file_path[0]) readTaskFile(search_task_date, task_file_path[1]);
    else {
      console.log();
      console.log(task_file_path[1]);
      rl.close();
    }
  });
}

async function readTaskFile(date, task_file_path) {
  try {
    const content = await fsPromises.readFile(task_file_path, 'utf-8');

    console.log("\n" + date);
    console.log("----------");
    console.log(content + "\n");
    rl.close();
  } catch (err) {
    console.error(err);
  }
}

async function markDone() {
  console.log(`\nStatus | Task`);
  console.log('---------------');
  console.log(`  0    | Wash my clothes.`);
  console.log(`  0    | Go hiking with my friends!`);
  console.log(`  0    | Go to garden city with my friends and watch Avengers Dooms Day.`);
  console.log(`  1    | Finish studying for Programming CAT.`);
  console.log(`  0    | TT`);
  console.log(`  1    | Play GTA IV for 2Hrs`);
  console.log("\nNOTE: 0 = Pending, 1 = Done");
}

rl.on('close', () => process.exit(0));

init();