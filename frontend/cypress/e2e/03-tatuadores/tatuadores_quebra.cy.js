// cypress/e2e/03-tatuadores/tatuadores_quebra.cy.js

describe('Testes de Tatuadores – Quebra de Sistema', () => {

  beforeEach(() => {
    cy.login();
  });

  it('Página de tatuadores deve carregar', () => {
    cy.visit('/tatuadores');

    cy.contains('Tatuadores').should('exist');
    cy.contains('Novo Tatuador').should('exist');
  });

  it('Cadastrar tatuador inválido deve falhar', () => {
    cy.visit('/tatuadores/novo');

    cy.get('input[name="nome"]').type('Teste 123$$$??');
    cy.get('input[name="email"]').type('aaaaa');
    cy.get('input[name="especialidade"]').type('A'.repeat(500));

    cy.get('button[type="submit"]').click();

    cy.contains('Erro').should('exist');
  });

});
