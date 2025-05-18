import layout from "./layoutReducer";
import paste from "@/components/partials/app/paste/store";
import email from "@/components/partials/app/email/store";
import chat from "@/components/partials/app/chat/store";
import project from "@/components/partials/app/projects/store";
import calendar from "@/components/partials/app/calender/store";
import auth from "@/components/partials/auth/store";
import beauty from "@/components/partials/app/beauty-js/store";
import openapi from "@/components/partials/app/openapi/store";
import artinama from "@/components/partials/app/arti-nama/store";
import playwright from "@/components/partials/app/playwright/store";
const rootReducer = {
  layout: layout,
  paste: paste,
  email: email,
  chat: chat,
  project: project,
  calendar: calendar,
  auth: auth,
  beauty: beauty,
  openapi: openapi,
  artinama: artinama,
  playwright: playwright
};
export default rootReducer;