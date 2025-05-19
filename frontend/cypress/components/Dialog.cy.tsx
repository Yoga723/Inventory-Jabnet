<<<<<<< HEAD
import FormRecords from "components/records/FormRecords";
import React from "react";

describe(`Modal Form untuk tambah Records baru`, () => {
  it("me-render dan membuka modal saat openModal dipanggil", () => {
    cy.mount(<FormRecords />);
    cy.get("button").contains("Tambah").click();
    cy.get('dialog').should('have.class', 'modal-open')
  });
});
=======
import FormRecords from "components/records/FormRecords";
import React from "react";

describe(`Modal Form untuk tambah Records baru`, () => {
  it("me-render dan membuka modal saat openModal dipanggil", () => {
    cy.mount(<FormRecords />);
    cy.get("button").contains("Tambah").click();
    cy.get('dialog').should('have.class', 'modal-open')
  });
});
>>>>>>> 4289c65a (change name placeholder)
