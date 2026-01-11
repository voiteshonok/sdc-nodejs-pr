const { StudentValidator } = require('../../../src/utils/StudentValidator');

describe('StudentValidator', () => {
  describe('validate', () => {
    describe('valid inputs', () => {
      it('should return isValid true for valid student data', () => {
        // Arrange
        const validData = {
          name: 'John Doe',
          age: 20,
          group: 2
        };

        // Act
        const result = StudentValidator.validate(validData);

        // Assert
        expect(result.isValid).toBe(true);
        expect(result.errors).toEqual([]);
        expect(result.value).toEqual(validData);
      });

      it('should trim string values', () => {
        // Arrange
        const dataWithSpaces = {
          name: '  John Doe  ',
          age: 20,
          group: 2
        };

        // Act
        const result = StudentValidator.validate(dataWithSpaces);

        // Assert
        expect(result.isValid).toBe(true);
        expect(result.value.name).toBe('John Doe');
      });

      it('should convert string numbers to integers', () => {
        // Arrange
        const dataWithStringNumbers = {
          name: 'John Doe',
          age: '20',
          group: '2'
        };

        // Act
        const result = StudentValidator.validate(dataWithStringNumbers);

        // Assert
        expect(result.isValid).toBe(true);
        expect(result.value.age).toBe(20);
        expect(result.value.group).toBe(2);
        expect(typeof result.value.age).toBe('number');
        expect(typeof result.value.group).toBe('number');
      });

      it('should strip unknown fields', () => {
        // Arrange
        const dataWithExtraFields = {
          name: 'John Doe',
          age: 20,
          group: 2,
          id: 1,
          extraField: 'should be removed'
        };

        // Act
        const result = StudentValidator.validate(dataWithExtraFields);

        // Assert
        expect(result.isValid).toBe(true);
        expect(result.value).not.toHaveProperty('id');
        expect(result.value).not.toHaveProperty('extraField');
        expect(result.value).toHaveProperty('name');
        expect(result.value).toHaveProperty('age');
        expect(result.value).toHaveProperty('group');
      });
    });

    describe('invalid inputs - missing fields', () => {
      it('should return isValid false when name is missing', () => {
        // Arrange
        const dataWithoutName = {
          age: 20,
          group: 2
        };

        // Act
        const result = StudentValidator.validate(dataWithoutName);

        // Assert
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
        expect(result.errors.some(err => err.includes('name'))).toBe(true);
      });

      it('should return isValid false when age is missing', () => {
        // Arrange
        const dataWithoutAge = {
          name: 'John Doe',
          group: 2
        };

        // Act
        const result = StudentValidator.validate(dataWithoutAge);

        // Assert
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
        expect(result.errors.some(err => err.includes('age'))).toBe(true);
      });

      it('should return isValid false when group is missing', () => {
        // Arrange
        const dataWithoutGroup = {
          name: 'John Doe',
          age: 20
        };

        // Act
        const result = StudentValidator.validate(dataWithoutGroup);

        // Assert
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
        expect(result.errors.some(err => err.includes('group'))).toBe(true);
      });

      it('should return isValid false when all fields are missing', () => {
        // Arrange
        const emptyData = {};

        // Act
        const result = StudentValidator.validate(emptyData);

        // Assert
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThanOrEqual(3);
      });
    });

    describe('invalid inputs - name validation', () => {
      it('should return isValid false when name is empty string', () => {
        // Arrange
        const dataWithEmptyName = {
          name: '',
          age: 20,
          group: 2
        };

        // Act
        const result = StudentValidator.validate(dataWithEmptyName);

        // Assert
        expect(result.isValid).toBe(false);
        expect(result.errors.some(err => err.includes('name'))).toBe(true);
      });

      it('should return isValid false when name is too long', () => {
        // Arrange
        const dataWithLongName = {
          name: 'a'.repeat(101), // 101 characters
          age: 20,
          group: 2
        };

        // Act
        const result = StudentValidator.validate(dataWithLongName);

        // Assert
        expect(result.isValid).toBe(false);
        expect(result.errors.some(err => err.includes('name') && err.includes('100'))).toBe(true);
      });

      it('should return isValid false when name is not a string', () => {
        // Arrange
        const dataWithNonStringName = {
          name: 123,
          age: 20,
          group: 2
        };

        // Act
        const result = StudentValidator.validate(dataWithNonStringName);

        // Assert
        expect(result.isValid).toBe(false);
        expect(result.errors.some(err => err.includes('name'))).toBe(true);
      });
    });

    describe('invalid inputs - age validation', () => {
      it('should return isValid false when age is negative', () => {
        // Arrange
        const dataWithNegativeAge = {
          name: 'John Doe',
          age: -1,
          group: 2
        };

        // Act
        const result = StudentValidator.validate(dataWithNegativeAge);

        // Assert
        expect(result.isValid).toBe(false);
        expect(result.errors.some(err => err.includes('age'))).toBe(true);
      });

      it('should return isValid false when age is too large', () => {
        // Arrange
        const dataWithLargeAge = {
          name: 'John Doe',
          age: 151,
          group: 2
        };

        // Act
        const result = StudentValidator.validate(dataWithLargeAge);

        // Assert
        expect(result.isValid).toBe(false);
        expect(result.errors.some(err => err.includes('age'))).toBe(true);
      });

      it('should return isValid false when age is not an integer', () => {
        // Arrange
        const dataWithFloatAge = {
          name: 'John Doe',
          age: 20.5,
          group: 2
        };

        // Act
        const result = StudentValidator.validate(dataWithFloatAge);

        // Assert
        expect(result.isValid).toBe(false);
        expect(result.errors.some(err => err.includes('age') && err.includes('integer'))).toBe(true);
      });

      it('should return isValid false when age is not a number', () => {
        // Arrange
        const dataWithStringAge = {
          name: 'John Doe',
          age: 'not a number',
          group: 2
        };

        // Act
        const result = StudentValidator.validate(dataWithStringAge);

        // Assert
        expect(result.isValid).toBe(false);
        expect(result.errors.some(err => err.includes('age'))).toBe(true);
      });

      it('should accept age 0', () => {
        // Arrange
        const dataWithZeroAge = {
          name: 'John Doe',
          age: 0,
          group: 2
        };

        // Act
        const result = StudentValidator.validate(dataWithZeroAge);

        // Assert
        expect(result.isValid).toBe(true);
      });

      it('should accept age 150', () => {
        // Arrange
        const dataWithMaxAge = {
          name: 'John Doe',
          age: 150,
          group: 2
        };

        // Act
        const result = StudentValidator.validate(dataWithMaxAge);

        // Assert
        expect(result.isValid).toBe(true);
      });
    });

    describe('invalid inputs - group validation', () => {
      it('should return isValid false when group is negative', () => {
        // Arrange
        const dataWithNegativeGroup = {
          name: 'John Doe',
          age: 20,
          group: -1
        };

        // Act
        const result = StudentValidator.validate(dataWithNegativeGroup);

        // Assert
        expect(result.isValid).toBe(false);
        expect(result.errors.some(err => err.includes('group'))).toBe(true);
      });

      it('should return isValid false when group is zero', () => {
        // Arrange
        const dataWithZeroGroup = {
          name: 'John Doe',
          age: 20,
          group: 0
        };

        // Act
        const result = StudentValidator.validate(dataWithZeroGroup);

        // Assert
        expect(result.isValid).toBe(false);
        expect(result.errors.some(err => err.includes('group') && err.includes('positive'))).toBe(true);
      });

      it('should return isValid false when group is not an integer', () => {
        // Arrange
        const dataWithFloatGroup = {
          name: 'John Doe',
          age: 20,
          group: 2.5
        };

        // Act
        const result = StudentValidator.validate(dataWithFloatGroup);

        // Assert
        expect(result.isValid).toBe(false);
        expect(result.errors.some(err => err.includes('group') && err.includes('integer'))).toBe(true);
      });

      it('should return isValid false when group is not a number', () => {
        // Arrange
        const dataWithStringGroup = {
          name: 'John Doe',
          age: 20,
          group: 'not a number'
        };

        // Act
        const result = StudentValidator.validate(dataWithStringGroup);

        // Assert
        expect(result.isValid).toBe(false);
        expect(result.errors.some(err => err.includes('group'))).toBe(true);
      });

      it('should accept positive group numbers', () => {
        // Arrange
        const dataWithPositiveGroup = {
          name: 'John Doe',
          age: 20,
          group: 1
        };

        // Act
        const result = StudentValidator.validate(dataWithPositiveGroup);

        // Assert
        expect(result.isValid).toBe(true);
      });
    });

    describe('multiple validation errors', () => {
      it('should collect all validation errors', () => {
        // Arrange
        const invalidData = {
          name: '',
          age: -5,
          group: 0
        };

        // Act
        const result = StudentValidator.validate(invalidData);

        // Assert
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThanOrEqual(3);
        expect(result.errors.some(err => err.includes('name'))).toBe(true);
        expect(result.errors.some(err => err.includes('age'))).toBe(true);
        expect(result.errors.some(err => err.includes('group'))).toBe(true);
      });
    });
  });
});

