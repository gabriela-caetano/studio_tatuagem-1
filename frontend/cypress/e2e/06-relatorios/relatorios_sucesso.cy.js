/// <reference types="cypress" />

describe('Relatórios — Fluxos Principais', () => {

  beforeEach(() => {
    cy.loginPadrao();
    cy.visit('/relatorios');
  });

  it('Carrega o dashboard', () => {
    cy.contains('Dashboard').should('exist');
    cy.contains('Total de Clientes').should('exist');
  });

  it('Filtra relatórios por data', () => {
    cy.get('input[name="data_inicio"]').type('2025-01-01');
    cy.get('input[name="data_fim"]').type('2025-12-31');

    cy.contains('Filtrar').click();

    cy.contains('Relatório atualizado').should('exist');
  });

});
