import { Helmet } from 'react-helmet-async';

import { UserView } from 'src/sections/hashtag/view';

// ----------------------------------------------------------------------

export default function UserPage() {
  return (
    <>
      <Helmet>
        <title> Hashtag | Minimal UI </title>
      </Helmet>

      <UserView />
    </>
  );
}
