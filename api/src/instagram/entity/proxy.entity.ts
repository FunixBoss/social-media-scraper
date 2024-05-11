import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('proxy')
export class Proxy {
    @PrimaryGeneratedColumn('increment', { name: 'id' })
    id?: number;

    @Column({ type: 'varchar', length: 200 })
    ip?: string;

    @Column({ type: 'varchar', length: 200 })
    port?: string;

    @Column({ type: 'varchar', length: 200, nullable: true })
    username?: string;

    @Column({ type: 'varchar', length: 200, nullable: true })
    password?: string;

    @Column({ type: 'varchar', length: 200 })
    country_code?: string;

    @Column({
        type: 'enum',
        enum: ['live', 'die', 'out_of_date'],
        default: 'live'
    })
    status?: 'live' | 'die' | 'out_of_date';

    @Column({ type: 'date' })
    import_date?: Date;

    @Column({ type: 'date' })
    expiration_date?: Date;

    @Column({ type: 'datetime' })
    last_checked?: Date;

    @Column({ type: 'datetime' })
    last_used?: Date;
}
