describe('Tatuadores / Portfólio', () => {
  beforeEach(() => {
    cy.apiLogin();
    cy.visit('/tatuadores');
  });

  it('cadastra tatuador com upload de imagem', () => {
    cy.contains(/novo tatuador|adicionar/i).click();
    cy.get('input[name="nome"]').type('Tatuador E2E');
    // use selectFile (Cypress integrado)
    cy.get('input[type="file"]').selectFile('cypress/fixtures/avatar.jpg', { force: true });
    cy.contains(/salvar|criar/i).click();
    cy.contains('Tatuador E2E', { timeout: 10000 }).should('exist');
  });
});