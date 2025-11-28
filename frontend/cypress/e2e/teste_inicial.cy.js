describe('Tela de Login - Teste Inicial', () => {
  it('abre a tela de login corretamente', () => {
    cy.visit('/login');

    // Verificar o título
    cy.contains('Studio Tatuagem').should('exist');
    cy.contains('Sistema de Gestão').should('exist');

    // Verificar campos
    cy.get('input[name="email"]').should('exist');
    cy.get('input[name="senha"]').should('exist');

    // Verificar botão Entrar
    cy.contains('Entrar').should('exist');
  });
});
