#!/usr/bin/env node

const readline = require('node:readline');
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const date = new Date();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
const _date = {
  'day': date.getDate() < 10 ? date.getDate() : date.getDate(),
  'month': date.getMonth() < 10 ? date.getMonth() + 1 : date.getMonth() + 1,
  'year': date.getFullYear()
}
const _filepaths = {
  'task': path.join(__dirname, 'tasks'),
  'year': path.join(__dirname, 'tasks', String(_date.year)),
  'month': path.join(__dirname, 'tasks', String(_date.year), String(_date.month))
}
let Tasks = {};
let tempArr = [];

console.log('--------------------Task Manager 1.0--------------------');
console.log('Choose an option:');
console.log('a - Add task');
console.log('m - Mark done');
console.log('v - View todays tasks or specify a date');
console.log('q - Quit Program');
console.log("---------------------------------------------------------");

async function init() {
  await createTree();

  rl.question('', (user_input) => {
    if (user_input == 'a') {
      console.log('Enter tasks to accomplish today: (q to quit)');
      writeTasks();
    }
    else if (user_input == 'm') markDone();
    else if (user_input == 'v') viewTasks();
    else if (user_input == 'q') process.exit(0);
    else {
      console.log(`Error: Invalid input\nValid Params: a - add task, v - view tasks, q - quit program`);
      rl.close();
    }
  });
}

async function createTree() {
  // If bug, check if you need to minus 1 from firstDay as it is in index format
  const firstDay = new Date(_date.year, _date.month - 1, 0).getDay();
  const week = Math.ceil((firstDay + _date.day) / 7);
  const filepath = path.join(_filepaths.month, `00${week}.json`);

  if (fs.existsSync(filepath)) {
    getTodaysTasks(filepath);
    return;
  };

  try {
    if (!fs.existsSync(_filepaths.task)) {
      await fsPromises.mkdir(_filepaths.task, { recursive: true });
    }
    if (!fs.existsSync(_filepaths.year)) {
      await fsPromises.mkdir(_filepaths.year, { recursive: true });
    }
    if (!fs.existsSync(_filepaths.month)) {
      await fsPromises.mkdir(_filepaths.month, { recursive: true });
    }
  } catch (err) {
    console.log('Could NOT create the recuired DIRECTORY.\n' + err);
    rl.close();
  }

  try {
    fsPromises.writeFile(filepath, '');

  } catch (err) { console.log('Could NOT create the required FILE.\n' + err) }
}

function writeTasks() {
  rl.question('> ', async user_input => {
    if (user_input == 'q') {
      await appendTasks();
      rl.close();
    }

    tempArr.push(user_input);
    writeTasks();
  });
}

async function appendTasks() {
  const todayKey = date.getDay();

  if (!Tasks[todayKey]) {
    Tasks[todayKey] = [];
  }
  Tasks[todayKey].push(...tempArr);

  try {
    const firstDay = new Date(_date.year, _date.month - 1, 0).getDay();
    const week = Math.ceil((firstDay + _date.day) / 7);
    const filepath = path.join(_filepaths.month, `00${week}.json`);
    const content = JSON.stringify(Tasks);
    
    await fsPromises.writeFile(filepath, content);
  } catch(err) {
    console.error("Failed to write tasks to file.", err);
  }
}

const getTodaysTasks = async filepath => {
  const content = await fsPromises.readFile(filepath, 'utf-8');

  if (!content) return;

  const newObj = JSON.parse(content);
  for (const dzy in newObj) {
    if(date.getDay() == dzy) {
      Tasks[`${date.getDay()}`] = newObj[`${dzy}`];
      return;
    }
  }
}



rl.on('close', () => process.exit(0));

init();

// Bug Report:
// 1. Type attributes on dates
// 2. Forgot to add a property name to the Tasks object when updating today's tasks.
// 3. The appendTasks function was not correctly writing to the file. Cause by the process quiting before the writeFile promise resolved. Fixed by making the function async and awaiting the writeFile operation.
// 4. Changed the file extension from .csv to .json for better data handling and parsing.