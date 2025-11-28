/// <reference types="cypress" />

describe('Autenticação — Testes que quebram', () => {

  it('SQL Injection no login', () => {
    cy.visit('/login');

    cy.get('input[name="email"]').type("admin@admin.com' OR '1'='1");
    cy.get('input[name="senha"]').type(" qualquer ");
    cy.contains('Entrar').click();

    cy.contains('credenciais', { matchCase: false }).should('exist');
  });

  it('Backend 500 no login', () => {
    cy.intercept('POST', '/api/auth/login', { statusCode: 500 }).as('err');

    cy.visit('/login');
    cy.get('input[name="email"]').type('admin@admin.com');
    cy.get('input[name="senha"]').type('admin123');
    cy.contains('Entrar').click();

    cy.contains('erro', { matchCase: false }).should('exist');
  });

});
