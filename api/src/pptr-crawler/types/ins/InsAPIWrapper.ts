import { InsHighlights } from './InsHighlights';
import { InsPosts } from './InsPosts';
import { InsProfileFull } from './InsProfile';
import { InsReelsFull } from './InsReels';

export interface InsAPIWrapper {
    data: InsProfileFull | InsReelsFull | InsHighlights;
    extensions: {
        is_final: boolean
    }
}