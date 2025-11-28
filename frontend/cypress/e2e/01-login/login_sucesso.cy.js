describe('Login - Sucesso', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.wait(500);
  });

  it('Login com credenciais válidas (Administrador)', () => {
    cy.get('input[name="email"]').type('admin@studio.com');
    cy.get('input[name="senha"]').type('admin123');

    cy.get('button[type="submit"]').click();

    cy.url().should('include', '/dashboard');

    cy.contains('Dashboard').should('exist');
  });

  it('Login com credenciais válidas (Tatuador)', () => {
    cy.visit('/login');
    cy.wait(500);

    cy.get('input[name="email"]').type('carlos@studio.com');
    cy.get('input[name="senha"]').type('carlos123');

    cy.get('button[type="submit"]').click();

    cy.url().should('include', '/dashboard');

    cy.contains('Dashboard').should('exist');
  });
});
