import { defineConfig } from "cypress";

export default defineConfig({
  component: {
    devServer: {
      framework: "next",
      bundler: "webpack",
    },
    specPattern: "cypress/component/**/*.cy.{js,ts,jsx,tsx}",
    supportFile: "cypress/support/component.ts",
  },

  e2e: {
    baseUrl: "http://localhost:3000",
    supportFile: "cypress/support/e2e.ts",
    specPattern: "cypress/e2e/**/*.cy.{js,ts,jsx,tsx}",
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
