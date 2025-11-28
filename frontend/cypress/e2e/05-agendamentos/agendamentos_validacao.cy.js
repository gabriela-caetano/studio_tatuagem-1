/// <reference types="cypress" />

describe('Agendamentos — Validações', () => {

  beforeEach(() => {
    cy.loginPadrao();
    cy.visit('/agendamentos');
  });

  it('Criar agendamento sem selecionar cliente', () => {
    cy.contains('Novo Agendamento').click();
    cy.contains('Salvar').click();

    cy.contains('cliente', { matchCase: false }).should('exist');
  });

  it('Criar com horário invertido (fim antes do início)', () => {
    cy.contains('Novo Agendamento').click();

    cy.get('input[name="data"]').type('2025-11-20');
    cy.get('input[name="hora_inicio"]').type('14:00');
    cy.get('input[name="hora_fim"]').type('13:00');

    cy.contains('Salvar').click();
    cy.contains('horário', { matchCase: false }).should('exist');
  });

  it('Criar em horário já ocupado (backend valida)', () => {
    cy.contains('Novo Agendamento').click();

    cy.get('[name="cliente_id"]').select(1);
    cy.get('[name="tatuador_id"]').select(1);
    cy.get('[name="servico_id"]').select(1);

    cy.get('input[name="data"]').type('2025-12-10');
    cy.get('input[name="hora_inicio"]').type('10:00');
    cy.get('input[name="hora_fim"]').type('11:00');

    cy.contains('Salvar').click();

    cy.contains('indisponível', { matchCase: false }).should('exist');
  });

});
