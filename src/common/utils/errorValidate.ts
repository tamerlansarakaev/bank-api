import { validate } from 'class-validator';

export const validateEntityData = async (data: object) => {
  const validationErrors = await validate(data).then((errors) =>
    errors.map((error) => error.constraints),
  );
  if (validationErrors.length) {
    return validationErrors;
  }
  return false;
};
