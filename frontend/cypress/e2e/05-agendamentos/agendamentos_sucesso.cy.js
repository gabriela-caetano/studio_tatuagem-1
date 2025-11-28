/// <reference types="cypress" />

describe('Agendamentos — Fluxo de Sucesso', () => {

  beforeEach(() => {
    cy.loginPadrao();
    cy.visit('/agendamentos');
    cy.wait(400);
  });

  it('Cria um agendamento válido', () => {
    cy.contains('Novo Agendamento').click();

    cy.get('[name="cliente_id"]').select(1);
    cy.get('[name="tatuador_id"]').select(1);
    cy.get('[name="servico_id"]').select(1);

    cy.get('input[name="data"]').type('2025-12-10');
    cy.get('input[name="hora_inicio"]').type('10:00');
    cy.get('input[name="hora_fim"]').type('11:00');

    cy.contains('Salvar').click();
    cy.contains('Agendamento criado com sucesso').should('exist');
  });

  it('Atualiza status para concluído', () => {
    cy.contains('Detalhes').first().click();
    cy.contains('Concluir').click();

    cy.get('textarea[name="observacoes"]').type('Tudo ok');
    cy.contains('Confirmar').click();

    cy.contains('concluído', { matchCase: false }).should('exist');
  });

  it('Cancela um agendamento', () => {
    cy.contains('Detalhes').first().click();
    cy.contains('Cancelar').click();
    cy.get('textarea[name="observacoes"]').type('Cliente desistiu');
    cy.contains('Confirmar').click();

    cy.contains('cancelado', { matchCase: false }).should('exist');
  });

});
