/// <reference types="cypress" />

describe('Login - Falhas esperadas', () => {

  beforeEach(() => {
    cy.visit('/login');
    cy.wait(500);
  });

  it('Campos vazios', () => {
    cy.get('button[type="submit"]').click();
    cy.wait(500);

    cy.contains('Erro').should('exist');
  });

  it('Email inexistente', () => {
    cy.get('input[name="email"]').type('naoexiste@email.com');
    cy.get('input[name="senha"]').type('123456');
    cy.get('button[type="submit"]').click();

    cy.contains('Verifique suas credenciais').should('exist');
  });

  it('Senha errada', () => {
    cy.get('input[name="email"]').type('admin@admin.com');
    cy.get('input[name="senha"]').type('senha_errada');
    cy.get('button[type="submit"]').click();

    cy.contains('Erro ao fazer login').should('exist');
  });

  it('Email com formato inválido', () => {
    cy.get('input[name="email"]').type('isso_nao_e_email');
    cy.get('input[name="senha"]').type('123456');
    cy.get('button[type="submit"]').click();

    cy.contains('Erro').should('exist');
  });

});
