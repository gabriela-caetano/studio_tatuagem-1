describe('Clientes (CRUD)', () => {
  beforeEach(() => {
    cy.apiLogin();
    cy.visit('/clientes');
  });

  it('cria, edita e apaga cliente (via UI)', () => {
    cy.contains(/novo cliente|adicionar cliente/i).click();
    cy.get('input[name="nome"]').type('Cliente E2E Test');
    cy.get('input[name="email"]').type(`e2e+${Date.now()}@studio.com`);
    cy.get('input[name="telefone"]').type('11999998888');
    cy.contains(/salvar|criar/i).click();
    cy.contains('Cliente E2E Test', { timeout: 10000 }).should('exist');

    // editar
    cy.contains('Cliente E2E Test').closest('tr').within(() => {
      cy.contains(/editar|alterar/i).click();
    });
    cy.get('input[name="nome"]').clear().type('Cliente E2E Test Edit');
    cy.contains(/salvar|atualizar/i).click();
    cy.contains('Cliente E2E Test Edit', { timeout: 10000 }).should('exist');

    // apagar
    cy.contains('Cliente E2E Test Edit').closest('tr').within(() => {
      cy.contains(/apagar|deletar|excluir/i).click();
    });
    cy.contains(/confirmar|sim/i).click();
    cy.contains('Cliente E2E Test Edit').should('not.exist');
  });

  it('busca e paginação', () => {
    cy.get('input[placeholder*="buscar"], input[name="search"]').type('teste');
    cy.contains(/buscar|pesquisar/i).click();
    cy.get('table').should('exist');
    cy.get('button').contains(/próxima|next/i).click({ force: true });
  });
});