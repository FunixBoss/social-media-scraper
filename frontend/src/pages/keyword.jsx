import { Helmet } from 'react-helmet-async';

import { UserView } from 'src/sections/keyword/view';

// ----------------------------------------------------------------------

export default function UserPage() {
  return (
    <>
      <Helmet>
        <title> keyword | Minimal UI </title>
      </Helmet>

      <UserView />
    </>
  );
}
