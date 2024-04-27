import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments, IsEmpty } from 'class-validator';

export const validChannelScraperInfos: string[] = ['profile', 'posts', 'reels', 'friendships', 'tagged', 'highlights'];

@ValidatorConstraint({ name: 'isValidScraperInfo', async: false })
export class IsValidScraperInfoConstraint implements ValidatorConstraintInterface {
    validate(value: string, args: ValidationArguments) {
        if(!value || value.length == 0) return false;
        const infos: string[] = value.split("-");
        if (!Array.isArray(infos)) {
            return false;
        } 
        // Check each item in the array
        for (const item of infos) {
            if (!validChannelScraperInfos.includes(item)) {
                return false;
            }
        }
        return true;
    }

    defaultMessage(args: ValidationArguments) {
        return `Each info in "${args.property}" must be one of: ${validChannelScraperInfos.join(', ')}`;
    }
}

export function IsValidScraperInfo(validationOptions?: ValidationOptions) {
    return function (object: any, propertyName: string) {
        registerDecorator({
            name: 'isValidScraperInfo',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: IsValidScraperInfoConstraint,
        });
    };
}
