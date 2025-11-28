/// <reference types="cypress" />

describe('Serviços — Testes que quebram o sistema', () => {

  beforeEach(() => {
    cy.loginPadrao();
    cy.visit('/servicos');
  });

  it('Nome gigantesco (5000 chars)', () => {
    cy.contains('Novo Serviço').click();
    cy.get('input[name="nome"]').type('A'.repeat(5000));
    cy.contains('Salvar').click();

    cy.contains('Erro', { matchCase: false }).should('exist');
  });

  it('Preço com caracteres estranhos', () => {
    cy.contains('Novo Serviço').click();
    cy.get('input[name="preco"]').type('@#$%@');
    cy.contains('Salvar').click();

    cy.contains('preço', { matchCase: false }).should('exist');
  });

  it('SQL Injection no nome', () => {
    cy.contains('Novo Serviço').click();
    cy.get('input[name="nome"]').type("Ink'; DROP TABLE servicos; --");
    cy.contains('Salvar').click();

    cy.contains('Erro', { matchCase: false }).should('exist');
  });

  it('Backend fora do ar (simulado)', () => {
    cy.intercept('POST', '/api/servicos', { forceNetworkError: true });

    cy.contains('Novo Serviço').click();
    cy.get('input[name="nome"]').type('Falha');
    cy.get('input[name="preco"]').type('200');
    cy.get('input[name="duracao"]').type('60');

    cy.contains('Salvar').click();

    cy.contains('conectar', { matchCase: false }).should('exist');
  });

});
