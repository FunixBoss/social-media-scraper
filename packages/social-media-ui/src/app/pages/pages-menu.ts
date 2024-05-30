import { NbMenuItem } from '@nebular/theme';

export const MENU_ITEMS_AUTHORIZED: NbMenuItem[] = [
  {
    title: 'FEATURES',
    group: true,
  },
  {
    title: 'Keywords',
    icon: 'grid-outline',
    expanded: true,
    children: [
      {
        title: 'Keyword List',
        link: '/keywords/list',
      },
      {
        title: 'Hashtag List',
        link: '/hashtags/list',
      },
    ],
  },
  {
    title: 'Channels',
    icon: 'grid-outline',
    expanded: true,
    children: [
      {
        title: 'Channel List',
        link: '/channels/list',
      },
      {
        title: 'Scrape Channels',
        link: '/channels/scrape',
      },
    ],
  },
];