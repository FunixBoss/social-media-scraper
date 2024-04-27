import { InsFriendshipUserFull } from './InsFriendship';
import { InsHighlightsFull } from './InsHighlights';
import { InsPostsFull } from './InsPosts';
import { InsProfileFull } from './InsProfile';
import { InsReelsFull } from './InsReels';

export interface InsAPIWrapper {
    data: InsProfileFull | InsReelsFull | InsHighlightsFull | InsPostsFull | InsFriendshipUserFull;
    extensions: {
        is_final: boolean
    }
}