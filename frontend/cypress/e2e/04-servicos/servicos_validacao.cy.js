/// <reference types="cypress" />

describe('Serviços — Validações', () => {

  beforeEach(() => {
    cy.loginPadrao();
    cy.visit('/servicos');
  });

  it('Campos obrigatórios vazios', () => {
    cy.contains('Novo Serviço').click();
    cy.contains('Salvar').click();
    cy.contains('campo obrigatório', { matchCase: false }).should('exist');
  });

  it('Preço inválido (texto)', () => {
    cy.contains('Novo Serviço').click();
    cy.get('input[name="preco"]').type('abc');
    cy.contains('Salvar').click();

    cy.contains('preço inválido', { matchCase: false }).should('exist');
  });

  it('Duração menor que 10 min', () => {
    cy.contains('Novo Serviço').click();
    cy.get('input[name="duracao"]').type('5');
    cy.contains('Salvar').click();

    cy.contains('duração', { matchCase: false }).should('exist');
  });

});
