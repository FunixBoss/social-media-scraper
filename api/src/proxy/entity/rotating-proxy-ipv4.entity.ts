import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('rotating-proxy-ipv4')
export class RotatingProxyIpv4 {
    @PrimaryGeneratedColumn('increment',  { type: 'bigint', name: 'id' })
    id?: number;

    @Column({ type: 'varchar', length: 200 })
    ip?: string;

    @Column({ type: 'int' })
    port?: number;

    @Column({ type: 'varchar', length: 200 })
    country_code?: string;

    @Column({
        type: 'enum',
        enum: ['live', 'die'],
        default: 'live'
    })
    status?: 'live' | 'die';

    @Column({ type: 'varchar', length: 200 })
    supplier?: string;

    @Column({ type: 'varchar', length: 200 })
    api_key?: string;

    @Column({ type: 'varchar', length: 200 })
    last_ip?: string;

    @Column({ type: 'datetime' })
    last_checked?: Date;
}
