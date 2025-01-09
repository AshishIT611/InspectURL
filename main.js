import validator from 'validator';
import chalk from 'chalk';
import fs from 'fs';
import { URL } from 'url';

let u = process.argv[2];
if (u === undefined) {
  console.log(chalk.red('Please enter a URL.'));
  process.exit(1);
}

function isBlock(x) {
  const bURLs = fs.existsSync('./BlockedURL.txt') 
    ? fs.readFileSync('./BlockedURL.txt', 'utf-8').split('\n').map(line => line.trim()) 
    : [];
  return bURLs.includes(x);
}

function saveUrlToJson(data) {
  const filePath = './urls.json';
  let existingData = [];
  if (fs.existsSync(filePath)) {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    existingData = fileContent ? JSON.parse(fileContent) : [];
  }
  existingData.push(data);
  fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2), 'utf-8');
}

if (validator.isURL(u)) {
  if (!isBlock(u)) {
    const parsedUrl = new URL(u);
    fs.appendFileSync('./enteredValidateURL.txt', `${u}\n`, 'utf-8');
    console.log(chalk.greenBright(`URL is valid and not blocked: ${u}`));
    const searchParams = Object.fromEntries(parsedUrl.searchParams.entries());
    const urlData = { url: u, status: "valid", blocked: false, accessedAt: new Date().toISOString() };
    if (Object.keys(searchParams).length > 0) {
      urlData.searchParams = searchParams;
      console.log(chalk.greenBright('Search Parameters:'), searchParams);
      const searchFile = './searchParameters.json';
      let existingData = [];
      if (fs.existsSync(searchFile)) {
        const fileContent = fs.readFileSync(searchFile, 'utf-8');
        existingData = fileContent ? JSON.parse(fileContent) : [];
      }
      existingData.push({ url: u, searchParams, accessedAt: new Date().toISOString() });
      fs.writeFileSync(searchFile, JSON.stringify(existingData, null, 2), 'utf-8');
      console.log(chalk.blueBright(`Search parameters saved to ${searchFile}`));
    } else {
      console.log(chalk.yellow('No search parameters found in the URL.'));
    }
    saveUrlToJson(urlData);
  } else {
    console.log(chalk.blackBright.bgRedBright('Blocked URL'));
    const urlData = { url: u, status: "blocked", blocked: true, accessedAt: new Date().toISOString() };
    saveUrlToJson(urlData);
  }
} else {
  console.log(chalk.redBright(`${u} is not a valid URL.`));
  const urlData = { url: u, status: "invalid", blocked: null, accessedAt: new Date().toISOString() };
  saveUrlToJson(urlData);
}