Cypress.Commands.add('loginPadrao', () => {
  cy.visit('/login');
  cy.wait(300);

  cy.get('input[name="email"]').type('admin@studio.com');
  cy.get('input[name="senha"]').type('admin123');
  cy.get('button[type="submit"]').click();

  cy.url().should('include', '/dashboard');
});
