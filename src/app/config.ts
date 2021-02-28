import dotenv from 'dotenv';

type EnvVars = {
  PORT: number;
  CERAMIC_API_HOST: string;
  THREE_ID_SEED: string;
  SYNC_INTERVAL: number;
};

const REQUIRED_ENV_VAR_KEYS = ['PORT', 'CERAMIC_API_HOST', 'THREE_ID_SEED'];

const result = dotenv.config({ path: '.env.local' });

if (result.error) {
  throw result.error;
}

const { parsed } = result;

if (!parsed) {
  throw new Error('Environmental variables not set in .env.local');
}

const parsedEnvVarKeys = Object.keys(parsed);

for (const requiredEnvVarKey of REQUIRED_ENV_VAR_KEYS) {
  if (!parsedEnvVarKeys.includes(requiredEnvVarKey)) {
    throw new Error(
      `Environmental variable: ${requiredEnvVarKey} is missing .env.local`
    );
  }
}

const envVars = (parsed as unknown) as EnvVars;

export default envVars;
