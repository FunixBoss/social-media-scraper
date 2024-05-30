import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class Priority {

    static HIGH = 'HIGH';
    static MEDIUM = 'MEDIUM';
    static LOW = 'LOW';

    @PrimaryColumn({ length: 50 })
    name: string;

    @Column({ length: 200, nullable: true })
    description: string;
} 