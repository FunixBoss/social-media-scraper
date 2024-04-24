import { Helmet } from 'react-helmet-async';

import { UserView } from 'src/sections/chanel/view';

// ----------------------------------------------------------------------

export default function UserPage() {
  return (
    <>
      <Helmet>
        <title> chanel | Minimal UI </title>
      </Helmet>

      <UserView />
    </>
  );
}
