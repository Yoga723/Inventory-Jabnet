import React from 'react'
import BarangInput from './BarangInput'

describe('<BarangInput />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<BarangInput />)
  })
})