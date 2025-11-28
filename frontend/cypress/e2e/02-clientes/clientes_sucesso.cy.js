/// <reference types="cypress" />

describe('Clientes - Fluxo de Sucesso', () => {

  beforeEach(() => {
    // Login antes de cada teste
    cy.visit('/login');
    cy.get('input[name="email"]').type('admin@studio.com');
    cy.get('input[name="senha"]').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');

    cy.visit('/clientes');
    cy.wait(400);
  });

  it('Criar cliente válido', () => {
    cy.contains('Novo Cliente').click();

    cy.get('input[name="nome"]').type('João Cliente');
    cy.get('input[name="telefone"]').type('35999999999');
    cy.get('input[name="email"]').type('joao@cliente.com');
    cy.get('input[name="data_nascimento"]').type('1990-05-10');

    cy.contains('Salvar').click();

    cy.contains('Cliente criado com sucesso').should('exist');
  });

  it('Editar cliente existente', () => {
    cy.contains('Editar').first().click();

    cy.get('input[name="nome"]').clear().type('João Editado');
    cy.contains('Salvar').click();

    cy.contains('Cliente atualizado com sucesso').should('exist');
  });

  it('Excluir cliente', () => {
    cy.contains('Excluir').first().click();
    cy.contains('Confirmar').click();

    cy.contains('Cliente removido com sucesso').should('exist');
  });

});
