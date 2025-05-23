describe("Testing Login ", () => {
  beforeEach(() => {
    cy.visit("http://localhost:3000/login");
  });
  it("Button is clicked and send request", () => {
    cy.get("[data-cypress='submit-login']");
  });
});
