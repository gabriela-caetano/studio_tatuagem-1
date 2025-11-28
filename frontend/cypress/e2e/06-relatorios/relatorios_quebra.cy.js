/// <reference types="cypress" />

describe('Relatórios — Testes que quebram', () => {

  beforeEach(() => {
    cy.loginPadrao();
    cy.visit('/relatorios');
  });

  it('Data início > data fim', () => {
    cy.get('input[name="data_inicio"]').type('2025-12-31');
    cy.get('input[name="data_fim"]').type('2025-01-01');

    cy.contains('Filtrar').click();

    cy.contains('data', { matchCase: false }).should('exist');
  });

  it('Backend retorna 500', () => {
    cy.intercept('GET', '/api/relatorios/dashboard*', { statusCode: 500 });

    cy.reload();

    cy.contains('Erro interno', { matchCase: false }).should('exist');
  });

});
