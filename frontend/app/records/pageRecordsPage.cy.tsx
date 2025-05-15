import React from 'react'
import RecordsPage from './page'

describe('<RecordsPage />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<RecordsPage />)
  })
})