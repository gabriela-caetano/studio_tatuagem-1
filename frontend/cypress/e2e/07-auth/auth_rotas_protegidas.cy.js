/// <reference types="cypress" />

describe('Rotas Protegidas — Sem Autorização', () => {

  it('Não permite acessar /dashboard sem token', () => {
    cy.clearLocalStorage();
    cy.visit('/dashboard');

    cy.url().should('include', '/login');
  });

  it('Token inválido', () => {
    cy.setLocalStorage('token', 'TOKEN_FALSO');
    cy.visit('/clientes');

    cy.url().should('include', '/login');
  });

});
