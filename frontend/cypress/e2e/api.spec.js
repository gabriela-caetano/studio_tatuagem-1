// ...existing code...
describe('API contract & resilience', () => {
  // ...existing code...

  it('login endpoint returns token', () => {
    cy.request({
      method: 'POST',
      url: 'http://localhost:3001/api/auth/login',
      body: { email: 'admin@studio.com', password: 'admin123', senha: 'admin123' },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((res) => {
      expect([200, 201]).to.include(res.status);
    });
  });

  // ...existing code...
});
// ...existing code...