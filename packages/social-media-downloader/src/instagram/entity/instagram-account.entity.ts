import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('instagram_account')
export class InstagramAccount {
    @PrimaryGeneratedColumn('increment', { name: 'id' })
    id?: number;

    @Column({ type: 'varchar', length: 200 })
    username?: string;

    @Column({ type: 'varchar', length: 200 })
    password?: string;

    @Column({ type: 'varchar', length: 200, name: '2fa' })
    twoFactorAuthentication?: string;

    @Column({ type: 'varchar', length: 10000 })
    cookie_string?: string;

    @Column({ type: 'varchar', length: 200 })
    mail?: string;

    @Column({
        type: 'enum',
        enum: ['live', 'ban', 'restrict'],
    })
    status?: 'live' | 'ban' | 'restrict';

    @Column({ type: 'date' })
    import_date?: Date;

    @Column({ type: 'datetime' })
    last_checked?: Date;

    @Column({ type: 'datetime' })
    last_used?: Date;
}
