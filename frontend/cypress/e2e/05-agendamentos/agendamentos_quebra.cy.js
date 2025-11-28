describe('Testes de Agendamentos – Quebra de Sistema', () => {

  beforeEach(() => {
    cy.login();
  });

  it('Página de agendamentos deve carregar', () => {
    cy.visit('/agendamentos');
    cy.contains('Agendamentos').should('exist');
  });

  it('Criar agendamento com data inválida deve falhar', () => {
    cy.visit('/agendamentos/novo');

    cy.get('input[name="cliente"]').type('1');
    cy.get('input[name="servico"]').type('1');
    cy.get('input[name="data"]').type('1999-01-01'); // passado

    cy.get('button[type="submit"]').click();

    cy.contains('Erro').should('exist');
  });

  it('Criar agendamento com texto gigante quebra o backend', () => {
    cy.visit('/agendamentos/novo');

    cy.get('textarea[name="observacoes"]').type('A'.repeat(3000));
    cy.get('button[type="submit"]').click();

    cy.contains('Erro').should('exist');
  });

});
