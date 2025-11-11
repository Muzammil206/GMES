import { defineRouting } from "next-intl/routing"
import { createNavigation } from "next-intl/navigation"

export const routing = defineRouting({
  locales: ["en", "fr"],
  defaultLocale: "en",
  pathnames: {
    "/": "/",
    "/login": {
      en: "/login",
      fr: "/login",
    },
    "/signup": {
      en: "/signup",
      fr: "/signup",
    },
    "/dashboard": {
      en: "/dashboard",
      fr: "/dashboard",
    },
    "/dashboard/add-event": {
      en: "/dashboard/add-event",
      fr: "/dashboard/add-event",
    },
    "/dashboard/manage-event": {
      en: "/dashboard/manage-event",
      fr: "/dashboard/manage-event",
    },
    // keep plural variant in case some components use it
    "/dashboard/manage-events": {
      en: "/dashboard/manage-events",
      fr: "/dashboard/manage-events",
    },
    "/dashboard/manage-users": {
      en: "/dashboard/manage-users",
      fr: "/dashboard/manage-users",
    },
    "/dashboard/map": {
      en: "/dashboard/map",
      fr: "/dashboard/map",
    },
    "/dashboard/import-data": {
      en: "/dashboard/import-data",
      fr: "/dashboard/import-data",
    },
    "/dashboard/registrations": {
      en: "/dashboard/registrations",
      fr: "/dashboard/registrations",
    },
    // Additional pathnames can be added here
  },
})

export const { Link, redirect, usePathname, useRouter } = createNavigation(routing)
