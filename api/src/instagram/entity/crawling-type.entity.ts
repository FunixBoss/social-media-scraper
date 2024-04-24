import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class CrawlingType {
    @PrimaryColumn({ length: 50 })
    name: string;
}