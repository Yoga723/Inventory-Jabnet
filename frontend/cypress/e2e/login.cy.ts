describe("Testing Login ", () => {
  beforeEach(() => {
    cy.visit("https://inventory.jabnet.id/login");
  });
  it("Button is clicked and send request", () => {
    cy.get("[data-cypress='submit-login']");
  });
});
