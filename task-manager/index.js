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
let taskArr = [];
let statusArr = [];
let todaysTasksArr = [];
let todaysStatusArr = [];

console.log('\n--------------------Task Manager 1.1--------------------');
console.log('Choose an option:');
console.log('a - Add task');
console.log('v - View tasks');
console.log('m - Mark done');
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
    else if (user_input == 'q') rl.close();
    else {
      console.log(`Error: Invalid input\nValid Params: a - add task, v - view tasks, q - quit program`);
      rl.close();
    }
  });
}

async function createTree() {
  // If bug, check if I need to minus 1 from firstDay as it is in index format
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
      appendTasks();
      rl.close();
    }

    taskArr.push(user_input);
    statusArr.push(0);
    writeTasks();
  });
}

async function appendTasks(tempStatusArr = null) {
  const Tasks = {};
  const todayKey = date.getDay();
  taskArr.push(...todaysTasksArr)
  statusArr.push(...todaysStatusArr)

  if (!Tasks) Tasks[todayKey] = [];
  if (tempStatusArr) statusArr = tempStatusArr;
  Tasks[todayKey] = [taskArr, statusArr];

  try {
    const firstDay = new Date(_date.year, _date.month - 1, 0).getDay();
    const week = Math.ceil((firstDay + _date.day) / 7);
    const filepath = path.join(_filepaths.month, `00${week}.json`);
    const content = JSON.stringify(Tasks);
    
    await fsPromises.writeFile(filepath, content);
    console.log("\nDone updating tasks...");
    process.exit(0);
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
      todaysTasksArr.push(...newObj[dzy][0]);
      todaysStatusArr.push(...newObj[dzy][1]);
      return;
    }
  }
}

function viewTasks() {
  let count = 1;
  let pendingIndexes = getPendingIndexes();

  if(todaysTasksArr.length <= 0) {
    console.log("No tasks have been added today.\n");
    rl.close();
  }
  console.log(`\nToday's Tasks: ${todaysTasksArr.length}`);
  todaysTasksArr.map(task => {
    console.log(`${count}: ${task}`);
    count++;
  });

  count = 1;
  if(pendingIndexes.length == 0) return;
  console.log(`\nPending Tasks: ${pendingIndexes.length}`);
  for(let i = 0; i < pendingIndexes.length; i++) {
    console.log(`${count}: ${todaysTasksArr[pendingIndexes[i]]}`);
    count++;
  }
  console.log();
  rl.close();
}

const getPendingIndexes = () => {
  let pending = [];
  let count = 0;
  for(let i = 0; i < todaysStatusArr.length; i++) {
    if(todaysStatusArr[count] == 0) pending.push(i);
    count++;
  }
  return pending;
}

function markDone() {
  let pendingIndexes = getPendingIndexes();
  let count = 1;

  console.log(`\nPending Tasks: ${pendingIndexes.length}`);
  pendingIndexes.map(index => {
    console.log(`${count}: ${todaysTasksArr[index]}`);
    count++;
  });
  
  rl.question('\nEnter task number to mark as done; separated by a single space. (1 2 3 4 ...n)\n', user_input => {
    const toMark = user_input.split(' ');
    const filtered = toMark.map(x => Number(x)).filter(x => Number.isFinite(x) && x != null);
    
    if(filtered.length <= 0) {
      console.log("\nPlease use given instructions:");
      console.log('Enter task number to mark as done; separated by a single space. (1 2 3 4 ...n)\n');
      rl.close();
    }

    // console.log(todaysStatusArr);
    // [0,0,0,0,0,0] -> todaysStatusArr
    // [1,2,3] -> filtered
    filtered.map(i => {
      if(todaysStatusArr.indexOf(todaysStatusArr[i]) == -1) {
        console.log(`Task number '${i}' out of range for today's tasks.`);
        console.log(`Please enter a number within the task range.(1 - ${pendingIndexes.length})`);
        rl.close();
      }
      todaysStatusArr[i -1] = 1;
    });
    
    // console.log(todaysStatusArr);
    // [0,1,1,1,0,0,] -> new todaysStatusArr
  
    appendTasks(todaysStatusArr);
  });
}

rl.on('close', () => process.exit(0));

init();

// Bug Report:
// 1. Type attributes on dates
// 2. Forgot to add a property name to the Tasks object when updating today's tasks.
// 3. The appendTasks function was not correctly writing to the file. Cause by the process quiting before the writeFile promise resolved. Fixed by making the function async and awaiting the writeFile operation.
// 4. Changed the file extension from .csv to .json for better data handling and parsing.
// 5. Skipped a couple of days and forgot all about the bug report section...