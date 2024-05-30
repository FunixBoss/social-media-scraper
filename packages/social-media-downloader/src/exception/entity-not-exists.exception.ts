import { NotFoundException } from "@nestjs/common";

export class EntityNotExists extends NotFoundException {
    constructor(entityName: string, id: string) {
        super(`${entityName} with id '${id}' not exists`);
    }
}