import { IDX } from '@ceramicstudio/idx';
import { definitions, schemas } from '@ceramicstudio/idx-constants';
import CeramicClient from '@ceramicnetwork/ceramic-http-client';

import {
  PUBLISHED_DEFINITIONS,
  PUBLISHED_SCHEMAS,
} from 'app/constants/definitions';
import config from 'app/config';

export const ceramic = new CeramicClient(config.CERAMIC_API_HOST);

export let idx: IDX;

export function createIDX(): void {
  idx = new IDX({
    ceramic,
    definitions: {
      ...definitions,
      ...PUBLISHED_DEFINITIONS,
    },
  });
}
