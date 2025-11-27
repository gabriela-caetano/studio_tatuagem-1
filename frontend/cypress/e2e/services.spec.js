describe('Serviços', () => {
  beforeEach(() => {
    cy.apiLogin();
    cy.visit('/servicos');
  });

  it('cria serviço com validações', () => {
    cy.contains(/novo serviço|adicionar serviço/i).click();
    cy.get('input[name="nome"]').type('Serviço E2E');
    cy.get('input[name="preco"]').type('0'); // preço inválido
    cy.contains(/salvar|criar/i).click();
    cy.contains(/preço|valor inválido/i).should('exist');

    cy.get('input[name="preco"]').clear().type('150.00');
    cy.get('input[name="duracao"]').clear().type('60');
    cy.contains(/salvar|criar/i).click();
    cy.contains('Serviço E2E', { timeout: 10000 }).should('exist');
  });
});