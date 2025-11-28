/// <reference types="cypress" />

describe('Clientes – Validações e Erros', () => {

  beforeEach(() => {
    cy.visit('/login');
    cy.get('input[name="email"]').type('admin@studio.com');
    cy.get('input[name="senha"]').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.visit('/clientes');
  });

  it('Campos obrigatórios vazios', () => {
    cy.contains('Novo Cliente').click();
    cy.contains('Salvar').click();

    cy.contains('Campo obrigatório').should('exist');
  });

  it('Telefone com letras (espera falhar)', () => {
    cy.contains('Novo Cliente').click();
    cy.get('input[name="telefone"]').type('ABC123');

    cy.contains('Salvar').click();
    cy.contains('telefone inválido', { matchCase: false }).should('exist');
  });

  it('Email inválido', () => {
    cy.contains('Novo Cliente').click();
    cy.get('input[name="email"]').type('isso_nao_e_email');
    cy.contains('Salvar').click();

    cy.contains('email inválido', { matchCase: false }).should('exist');
  });

  it('Data inválida (ex: 30/02)', () => {
    cy.contains('Novo Cliente').click();

    cy.get('input[name="data_nascimento"]').type('2025-02-30');

    cy.contains('Salvar').click();
    cy.contains('data', { matchCase: false }).should('exist');
  });

});
