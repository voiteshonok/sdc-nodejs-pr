const Joi = require('joi');

/**
 * StudentValidator
 *
 * Uses Joi schema validation for student data from the frontend.
 *
 * Usage:
 *   const { StudentValidator } = require('./StudentValidator');
 *   const { isValid, errors, value } = StudentValidator.validate(req.body);
 *
 *   if (!isValid) {
 *     return res.status(400).send({ errors });
 *   }
 */

const studentSchema = Joi.object({
  name: Joi.string()
    .trim()
    .max(100)
    .required()
    .messages({
      'string.base': 'name must be a string',
      'string.empty': 'name is required',
      'string.max': 'name must be at most 100 characters long',
      'any.required': 'name is required',
    }),

  age: Joi.number()
    .integer()
    .min(0)
    .max(150)
    .required()
    .messages({
      'number.base': 'age must be a number',
      'number.integer': 'age must be an integer',
      'number.min': 'age must be between 0 and 150',
      'number.max': 'age must be between 0 and 150',
      'any.required': 'age is required',
    }),

  group: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'group must be a number',
      'number.integer': 'group must be an integer',
      'number.positive': 'group must be a positive number',
      'any.required': 'group is required',
    }),
});

class StudentValidator {
  /**
   * Validate student data (name, age, group).
   * Does NOT validate id.
   *
   * @param {object} payload - raw data from request
   * @returns {{ isValid: boolean, errors: string[], value: object }}
   */
  static validate(payload) {
    const { error, value } = studentSchema.validate(payload, {
      abortEarly: false,   // collect all errors
      stripUnknown: true,  // remove unexpected fields
      convert: true,       // cast strings to numbers, trim strings, etc.
    });

    if (!error) {
      return { isValid: true, errors: [], value };
    }

    const errors = error.details.map((d) => d.message);
    return {
      isValid: false,
      errors,
      value,
    };
  }
}

module.exports = { StudentValidator };


