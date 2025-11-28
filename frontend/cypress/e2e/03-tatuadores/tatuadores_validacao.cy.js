/// <reference types="cypress" />

describe('Tatuadores — Validações', () => {

  beforeEach(() => {
    cy.visit('/login');
    cy.get('input[name="email"]').type('admin@studio.com');
    cy.get('input[name="senha"]').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.visit('/tatuadores');
  });

  it('Campos vazios', () => {
    cy.contains('Novo Tatuador').click();
    cy.contains('Salvar').click();

    cy.contains('Campo obrigatório').should('exist');
  });

  it('Especialidade inválida (números)', () => {
    cy.contains('Novo Tatuador').click();

    cy.get('input[name="especialidade"]').type('12345');

    cy.contains('Salvar').click();

    cy.contains('especialidade', { matchCase: false }).should('exist');
  });

});
