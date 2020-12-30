import chalk from 'chalk';

export const logIndexer = makeLogger(chalk.cyan('[indexer]'));

export const logDB = makeLogger(chalk.magenta('[mongodb]'));

export const logRecommender = makeLogger(chalk.yellow('[recomm]'));

function makeLogger(prefix: string) {
  function logger(message: string) {
    return console.log(prefix.padEnd(10, ' ') + message);
  }
  return logger;
}
