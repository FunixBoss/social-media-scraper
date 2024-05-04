import { Entity, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { Channel } from './channel.entity';

@Entity()
export class ChannelFriendship {
    @PrimaryColumn({ type: 'varchar', length: 200 })
    username?: string;

    @PrimaryColumn({ type: 'varchar', length: 200 })
    channel_username?: string;

    @ManyToOne(() => Channel, { onDelete: 'NO ACTION' })
    @JoinColumn({ name: 'username', referencedColumnName: 'username' })
    channel?: Channel;

    @ManyToOne(() => Channel, { onDelete: 'NO ACTION' })
    @JoinColumn({ name: 'channel_username', referencedColumnName: 'username' })
    friendship_channels?: Channel;
}