/// <reference types="cypress" />

describe('Tatuadores - Fluxo de Sucesso', () => {

  beforeEach(() => {
    cy.visit('/login');
    cy.get('input[name="email"]').type('admin@studio.com');
    cy.get('input[name="senha"]').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.visit('/tatuadores');
  });

  it('Criar tatuador válido', () => {
    cy.contains('Novo Tatuador').click();

    cy.get('input[name="nome"]').type('Tattoo Master');
    cy.get('input[name="especialidade"]').type('Realismo');
    cy.contains('Salvar').click();

    cy.contains('Tatuador criado com sucesso').should('exist');
  });

  it('Editar tatuador', () => {
    cy.contains('Editar').first().click();

    cy.get('input[name="nome"]').clear().type('Tattoo Editado');
    cy.contains('Salvar').click();

    cy.contains('Tatuador atualizado com sucesso').should('exist');
  });

  it('Excluir tatuador', () => {
    cy.contains('Excluir').first().click();

    cy.contains('Confirmar').click();

    cy.contains('Tatuador removido com sucesso').should('exist');
  });

});
