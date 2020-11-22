import Ajv from 'ajv';

type Schema = {
  type: string;
  properties: {
    [key: string]: {
      type: string;
    };
  };
  required: Array<string>;
};

export function validateObject(schema: Schema, objectToValidate: any): void {
  const ajv = new Ajv();
  const isValid = ajv.validate(schema, objectToValidate);

  if (!isValid) {
    throw new Error(
      ajv.errors?.length === 1 ? JSON.stringify(ajv.errors[0]) : 'Not valid'
    );
  }
}
