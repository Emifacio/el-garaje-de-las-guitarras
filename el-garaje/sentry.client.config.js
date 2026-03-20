import * as Sentry from "@sentry/astro";

Sentry.init({
  dsn: "https://d80401f8e4922e1736e9209b8105eb92@o4511077005131776.ingest.us.sentry.io/4511077008408576",
  sendDefaultPii: true,
});
