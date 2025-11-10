import { defineRouting } from "next-intl/routing"
import { createNavigation } from "next-intl/navigation"

export const routing = defineRouting({
  locales: ["en", "fr"],
  defaultLocale: "en",
  pathnames: {
    "/": "/",
    "/login": {
      en: "/login",
      fr: "/connexion",
    },
    "/signup": {
      en: "/signup",
      fr: "/inscription",
    },
    "/dashboard": {
      en: "/dashboard",
      fr: "/tableau-de-bord",
    },
    "/dashboard/add-event": {
      en: "/dashboard/add-event",
      fr: "/tableau-de-bord/ajouter-evenement",
    },
    "/dashboard/manage-event": {
      en: "/dashboard/manage-event",
      fr: "/tableau-de-bord/gerer-evenements",
    },
    // keep plural variant in case some components use it
    "/dashboard/manage-events": {
      en: "/dashboard/manage-events",
      fr: "/tableau-de-bord/gerer-evenements",
    },
    "/dashboard/manage-users": {
      en: "/dashboard/manage-users",
      fr: "/tableau-de-bord/gerer-utilisateurs",
    },
    "/dashboard/map": {
      en: "/dashboard/map",
      fr: "/tableau-de-bord/carte",
    },
    "/dashboard/import-data": {
      en: "/dashboard/import-data",
      fr: "/tableau-de-bord/importer-donnees",
    },
    "/dashboard/registrations": {
      en: "/dashboard/registrations",
      fr: "/tableau-de-bord/inscriptions",
    },
    // Additional pathnames can be added here
  },
})

export const { Link, redirect, usePathname, useRouter } = createNavigation(routing)
