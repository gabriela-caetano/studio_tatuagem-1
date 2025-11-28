/// <reference types="cypress" />

describe('Sanity Check - Sistema no ar', () => {

  it('Frontend carrega', () => {
    cy.visit('/');
    cy.wait(500);
    cy.get('body').should('be.visible');
  });

  it('Backend responde', () => {
    cy.request('http://localhost:3001/api/health')
      .its('status')
      .should('eq', 200);
  });

  it('Página de login exibe campos essenciais', () => {
    cy.visit('/login');
    cy.contains('Studio Tatuagem').should('exist');
    cy.contains('Sistema de Gestão').should('exist');
    cy.get('input[name="email"]').should('exist');
    cy.get('input[name="senha"]').should('exist');
  });

});
