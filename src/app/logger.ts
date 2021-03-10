import chalk from 'chalk';
import { formatISO } from 'date-fns';

export const logIndexer = makeLogger(chalk.cyan('[indexer]'));

export const logRecommender = makeLogger(chalk.yellow('[recomme]'));

function makeLogger(prefix: string) {
  function logger(message: string) {
    return console.log(
      `${prefix.padEnd(10, ' ')} ${chalk.green(
        formatISO(new Date(), { representation: 'time' })
      )} ${message}`
    );
  }
  return logger;
}
