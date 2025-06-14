
import FormProductLog from "components/records/FormProductLog";
import React from "react";

describe(`Modal Form untuk tambah Records baru`, () => {
  it("me-render dan membuka modal saat openModal dipanggil", () => {
    cy.mount(<FormProductLog />);
    cy.get("button").contains("Tambah").click();
    cy.get('dialog').should('have.class', 'modal-open')
  });
});
