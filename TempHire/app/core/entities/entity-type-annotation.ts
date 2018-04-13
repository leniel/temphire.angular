import { Validator } from 'breeze-client';

export class EntityTypeAnnotation {
    validators: Validator[];
    propertyAnnotations: EntityPropertyAnnotation[];
    
    constructor(args: { validators?: Validator[], propertyAnnotations?: EntityPropertyAnnotation[] }) {
        this.validators = args.validators || [];
        this.propertyAnnotations = args.propertyAnnotations || [];
    }    
}

export class EntityPropertyAnnotation {
    displayName: string;
    validators: Validator[];
    constructor(public propertyName: string, config: {
        displayName: string,
        validators: Validator[],  
    }) {
        this.displayName = config.displayName;
        this.validators = config.validators;
    } 

}