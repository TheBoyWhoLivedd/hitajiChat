import {
  ChatCircleDots,
  Gear,
  GearSix,
  Phone,
  SignOut,
  User,
  House,
  SunDim,
  Bell,
  CreditCard,
  Folder,
} from "phosphor-react";

const Profile_Menu = [
  {
    title: "Profile",
    link: "/profile",
    icon: <User />,
  },
  {
    title: "Settings",
    link: "/settings",
    icon: <Gear />,
  },
  {
    title: "Billing",
    link: "/billing",
    icon: <CreditCard />,
  },
  {
    title: "Sign Out",
    link: "/sign-out",
    icon: <SignOut />,
  },
];

const Nav_Buttons = [
  {
    index: 0,
    icon: <ChatCircleDots />,
    description: "Chats",
    path: "app",
  },
  {
    index: 1,
    icon: <Bell />,
    description: "Notifications",
    path: "notifications",
  },
];

const Message_options = [
  {
    title: "Copy",
  },
  {
    title: "Reply",
  },
  {
    title: "Star message",
  },
];

export { Profile_Menu, Nav_Buttons, Message_options };
