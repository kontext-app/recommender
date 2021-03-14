// eslint-disable-next-line @typescript-eslint/no-var-requires
const NodeCache = require('node-cache');

export let cache: any;

export function initCache() {
  cache = new NodeCache({ stdTTL: 0, checkperiod: 0 });
}
