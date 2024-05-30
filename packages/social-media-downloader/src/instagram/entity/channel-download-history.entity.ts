import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Channel } from "./channel.entity";

@Entity()
export class ChannelDownloadHistory {
    @PrimaryGeneratedColumn()
    id?: number;

    @Column({ type: 'varchar', length: 200 })
    channel_username?: string;

    @Column({ type: 'varchar', length: 200 })
    download_type?: string;

    @Column({ type: 'varchar', length: 200 })
    file_name?: string;

    @Column({ type: 'int' })
    from_order?: number;

    @Column({ type: 'int' })
    to_order?: number;

    @Column({ type: 'varchar', length: 200 })
    download_directory?: string;

    @Column({ type: 'datetime' })
    date?: Date;

    @ManyToOne(() => Channel)
    @JoinColumn({ name: 'channel_username', referencedColumnName: 'username' })
    channel?: Channel;
}