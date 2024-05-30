import { NotFoundException } from "@nestjs/common";

export class EntityAlreadyExists extends NotFoundException {
    constructor(entityName: string, id: string) {
        super(`${entityName} with id '${id}' already exists`);
    }
}