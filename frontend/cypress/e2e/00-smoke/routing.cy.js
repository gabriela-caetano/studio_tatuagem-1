/// <reference types="cypress" />

describe('Smoke Test - Navegação básica', () => {

  it('Redireciona para login se tentar acessar /dashboard sem estar logado', () => {
    cy.visit('/dashboard');
    cy.url().should('include', '/login');
  });

  it('Erro 404 exibe página padrão (rota inexistente)', () => {
    cy.visit('/isso-nao-existe', { failOnStatusCode: false });
    cy.contains('404').should('exist');
  });

});
