import { NavItem } from "@/types";


export const navItems: NavItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: "dashboard",
    shortcut: ["d", "d"],
    permission: "view-dashboard",
  },
  {
    title: "Orders",
    url: "#",
    icon: "orders",
    permission: "view-order",
    items: [
      {
        title: "Orders",
        url: "/orders",
        icon: "orders",
        permission: "view-order",
        shortcut: ["o", "r"],
      },
      {
        title: "Pre Orders",
        url: "/pre-orders",
        icon: "preOrder",
        permission: "view-pre_order",
        shortcut: ["p", "o"],
      },
      {
        title: "Return Orders",
        url: "/return-orders",
        icon: "returnOrder",
        permission: "view-return_order",
        shortcut: ["r", "o"],
      },
    ],
  },
  {
    title: "Clients",
    url: "/clients",
    icon: "clients",
    permission: "view-client",
    shortcut: ["c", "l"],
  },
  {
    title: "Products",
    url: "/products",
    icon: "product",
    permission: "view-product",
    shortcut: ["p", "r"],
  },
  {
    title: "Categories",
    url: "/categories",
    icon: "layers",
    permission: "view-category",
    shortcut: ["c", "c"],
  },
  {
    title: "Stock",
    url: "#",
    icon: "billing",
    isActive: false,
    permission: "view-stock",
    items: [
      {
        title: "Stocks",
        url: "/stocks",
        icon: "box",
        permission: "view-stock",
        shortcut: ["s", "k"],
      },
      {
        title: "Stock Adjustments",
        url: "/stock-adjustments",
        icon: "sliders",
        permission: "view-stock_adjustment",
        shortcut: ["s", "a"],
      },
    ],
  },
  {
    title: "Coupons",
    url: "/coupons",
    icon: "coupon",
    permission: "view-coupon",
    shortcut: ["c", "o"],
  },
  {
    title: "E-commerce",
    url: "#",
    icon: "ecommerce",
    permission: "view-home_section",
    shortcut: ["e", "c"],
    items: [
      {
        title: "Home Sections",
        url: "/home-sections",
        icon: "layers",
        permission: "view-home_section",
        shortcut: ["h", "s"],
      },
      {
        title: "Team Members",
        url: "/team-members",
        icon: "employee",
        permission: "view-team_member",
        shortcut: ["t", "m"],
      },
    ],
  },
  {
    title: "Reports",
    url: "#",
    icon: "reports",
    permission: "view-report",
    shortcut: ["r", "p"],
    items: [
      {
        title: "Sales Report",
        url: "/reports/sales",
        icon: "reports",
        permission: "view-sales_report",
        shortcut: ["r", "s"],
      },
      {
        title: "Product Report",
        url: "/reports/products",
        icon: "product",
        permission: "view-product_report",
        shortcut: ["r", "p"],
      },
      {
        title: "Category Report",
        url: "/reports/categories",
        icon: "layers",
        permission: "view-category_report",
        shortcut: ["r", "c"],
      },
      {
        title: "Client Report",
        url: "/reports/clients",
        icon: "clients",
        permission: "view-client_report",
        shortcut: ["r", "l"],
      },
      {
        title: "Payment Report",
        url: "/reports/payments",
        icon: "billing", // You might want to use a payment-specific icon
        permission: "view-payment_report",
        shortcut: ["r", "m"], // Using 'm' for payments to avoid conflict
      },
      {
        title: "Refunds Report",
        url: "/reports/refunds",
        icon: "refund", // You might want to use a refund-specific icon
        permission: "view-refunds_report",
        shortcut: ["r", "f"],
      },
      {
        title: "Delivery Performance Report",
        url: "/reports/delivery-performance",
        icon: "delivery", // You might want to use a delivery-specific icon
        permission: "view-delivery_performance_report",
        shortcut: ["r", "d"],
      }
    ],
  },
  {
    title: "Reviews",
    url: "/reviews",
    icon: "reviews",
    permission: "view-review",
    shortcut: ["r", "v"],
  },
  {
    title: "Contacts",
    url: "/contacts",
    icon: "contact",
    permission: "view-contacts",
    shortcut: ["c", "t"],
  },
  {
    title: "Promotional Emails",
    url: "/promotional-emails",
    icon: "mail",
    permission: "view-promotional_emails",
    shortcut: ["p", "e"],
  },
];


export const profileDropdownItems = [
  {
    permission: "view-profile",
    to: "/profile",
    translationKey: "Profile",
    shortcut: ['p', 'f'],
  },
  {
    permission: "view-settings",
    to: "/settings",
    translationKey: "Settings",
    shortcut: ['s', 't'],
  },
  {
    permission: "view-user",
    to: "/users",
    translationKey: "Users",
    shortcut: ['u', 'u'],
  },
  {
    permission: "view-activity_logs",
    to: "/activity-logs",
    translationKey: "Activity-logs",
    shortcut: ['l', 'l'],
  },
];
