/// <reference types="cypress" />

describe('Serviços — Fluxo de Sucesso', () => {

  beforeEach(() => {
    cy.loginPadrao();
    cy.visit('/servicos');
    cy.wait(300);
  });

  it('Cria um serviço válido', () => {
    cy.contains('Novo Serviço').click();

    cy.get('input[name="nome"]').type('Piercing');
    cy.get('input[name="preco"]').type('150');
    cy.get('input[name="duracao"]').type('60');

    cy.contains('Salvar').click();

    cy.contains('Serviço criado com sucesso').should('exist');
  });

  it('Edita um serviço existente', () => {
    cy.contains('Editar').first().click();
    cy.get('input[name="nome"]').clear().type('Piercing Nasal');
    cy.contains('Salvar').click();

    cy.contains('Serviço atualizado com sucesso').should('exist');
  });

  it('Exclui um serviço', () => {
    cy.contains('Excluir').first().click();
    cy.contains('Confirmar').click();

    cy.contains('Serviço removido com sucesso').should('exist');
  });

});
