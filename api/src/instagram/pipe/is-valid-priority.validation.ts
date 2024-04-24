import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ name: 'validPriority', async: false })
export class ValidPriorityConstraint implements ValidatorConstraintInterface {
  validate(value: any) {
    const validPriorities = ['low', 'medium', 'high'];
    return validPriorities.includes(value.toLowerCase());
  }

  defaultMessage() {
    return `Priority must be one of: low, medium, high`;
  }
}

export function IsValidPriority(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: ValidPriorityConstraint,
    });
  };
}
