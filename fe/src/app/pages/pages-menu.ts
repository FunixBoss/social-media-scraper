import { NbMenuItem } from '@nebular/theme';

export const MENU_ITEMS_AUTHORIZED: NbMenuItem[] = [
  {
    title: 'Dashboard',
    icon: 'home-outline',
    link: '/admin/dashboard',
    home: true,
  },
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
        link: '/admin/keywords/list',
      },
    ],
  },
  {
    title: 'Products',
    icon: 'grid-outline',
    expanded: true,
    children: [
      {
        title: 'Product List',
        link: '/admin/products/list',
      },
      {
        title: 'Add A Product',
        link: '/admin/products/add',
      },
      {
        title: 'Product Catalog',
        link: '/admin/products/catalog',
      },
      {
        title: 'Product Coupon',
        link: '/admin/products/coupon',
      },
      {
        title: 'Product Sale',
        link: '/admin/products/product-sale',
      },
    ],
  },
  {
    title: 'Orders',
    icon: 'clipboard-outline',
    expanded: true,
    children: [
      {
        title: 'Order List',
        link: '/admin/orders/list',
      },
      {
        title: 'Add An Order',
        link: '/admin/orders/add',
      },
    ]
  },
  {
    title: 'Customers',
    icon: 'person-done-outline',
    expanded: true,
    children: [
      {
        title: "Customer List",
        link: '/admin/customers/list',
      },
      {
        title: "Contact",
        link: '/admin/customers/contact',
      }
    ]
  },
  {
    title: 'Logout',
    icon: 'log-out-outline',
    link: '/admin/auth/logout',
  },
];

export const MENU_ITEMS_UNAUTHORIZED: NbMenuItem[] = [
  {
    title: 'Login',
    icon: 'lock-outline',
    link: '/admin/auth/login',
  },
  {
    title: '',
    group: true,
  },
]
