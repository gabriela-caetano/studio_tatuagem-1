// cypress/e2e/02-clientes/clientes_quebra.cy.js

describe('Testes de Clientes – Quebra de Sistema', () => {

  beforeEach(() => {
    cy.login();
  });

  it('Página de clientes deve carregar', () => {
    cy.visit('/clientes');
    cy.contains('Clientes').should('exist');
    cy.contains('Novo Cliente').should('exist');
  });

  it('Cadastrar cliente com dados inválidos deve falhar', () => {
    cy.visit('/clientes/novo');

    cy.get('input[name="nome"]').type('G@bi#$%123');
    cy.get('input[name="cpf"]').type('00000000000'); // CPF inválido
    cy.get('input[name="email"]').type('email-inválido');
    cy.get('input[name="telefone"]').type('ABCD1234');
    cy.get('input[name="data_nascimento"]').type('2050-10-10'); // futuro

    cy.get('button[type="submit"]').click();

    cy.contains('Dados inválidos').should('exist');
  });

  it('Tentar cadastrar cliente com 2000 caracteres quebra o sistema', () => {
    cy.visit('/clientes/novo');

    const textoMuitoGrande = 'A'.repeat(2000);

    cy.get('input[name="nome"]').type(textoMuitoGrande);
    cy.get('button[type="submit"]').click();

    cy.contains('Erro').should('exist');
  });

});
