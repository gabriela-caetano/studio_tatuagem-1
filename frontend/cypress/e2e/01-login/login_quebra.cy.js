// cypress/e2e/01-login/login_quebra.cy.js

describe('Testes de Login – Quebra de Sistema', () => {

  it('Login com credenciais válidas (Administrador)', () => {
    cy.visit('/login');

    cy.get('input[name="email"]').type('admin@studio.com');
    cy.get('input[name="senha"]').type('admin123');
    cy.get('button[type="submit"]').click();

    // Deve redirecionar ao dashboard
    cy.url().should('include', '/dashboard');
  });

  it('Login com usuário válido (Tatuador) – deve funcionar', () => {
    cy.visit('/login');

    cy.get('input[name="email"]').type('carlos@studio.com');
    cy.get('input[name="senha"]').type('carlos123');
    cy.get('button[type="submit"]').click();

    cy.url().should('include', '/dashboard');
  });

  it('Login com email inválido', () => {
    cy.visit('/login');

    cy.get('input[name="email"]').type('aaaaa@bbbbb');
    cy.get('input[name="senha"]').type('123456');
    cy.get('button[type="submit"]').click();

    cy.contains('Erro ao fazer login').should('exist');
  });

  it('Login com senha errada', () => {
    cy.visit('/login');

    cy.get('input[name="email"]').type('admin@studio.com');
    cy.get('input[name="senha"]').type('senhaerrada123');
    cy.get('button[type="submit"]').click();

    cy.contains('Erro ao fazer login').should('exist');
  });

  it('Login com campos vazios', () => {
    cy.visit('/login');

    cy.get('button[type="submit"]').click();

    cy.contains('Erro ao fazer login').should('exist');
  });
});
