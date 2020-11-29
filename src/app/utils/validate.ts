import Ajv, { ErrorObject } from 'ajv';

type Schema = {
  type: string;
  properties: {
    [key: string]: {
      type: string;
    };
  };
  required: Array<string>;
};

const ajv = new Ajv();

export function validate<T>(
  schema: Schema,
  objectToValidate: unknown
): objectToValidate is T {
  const isValid = ajv.validate(schema, objectToValidate);

  if (!isValid) {
    return false;
  }

  return true;
}

export function throwValidationError(): Error | ErrorObject {
  const ajv = new Ajv();
  throw ajv.errors ? ajv.errors[0] : new Error('Validation error');
}
