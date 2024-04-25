import { InsFriendshipUsers } from "./InsFriendship";
import { InsHighlights } from "./InsHighlights";
import { InsPosts } from "./InsPosts";
import { InsProfile } from "./InsProfile";
import { InsReels } from "./InsReels";

export default interface InsUser {
    profile: InsProfile;
    highlights: InsHighlights;
    friendshipUsers: InsFriendshipUsers;
    posts: InsPosts;
    reels: InsReels;
}