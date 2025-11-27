// ...existing code...
Cypress.Commands.add('apiLogin', (email = 'admin@studio.com', password = 'admin123') => {
  return cy.request({
    method: 'POST',
    url: 'http://localhost:3001/api/auth/login',
    headers: { 'Content-Type': 'application/json' },
    body: { email, password, senha: password }, // envia ambos
    failOnStatusCode: false
  }).then((resp) => {
    const token = resp.body?.token || resp.body?.data?.token || resp.body?.accessToken || resp.body?.access_token;
    if (!token) return cy.wrap(resp);

    // coloca token em várias chaves e cookie (tenta cobrir implantações diferentes)
    return cy.visit('/', {
      onBeforeLoad(win) {
        try {
          win.localStorage.setItem('token', token);
          win.localStorage.setItem('accessToken', token);
          win.localStorage.setItem('authToken', token);
          // se a app guarda um objeto user/auth, tenta setar também
          try {
            const prev = JSON.parse(win.localStorage.getItem('user') || '{}');
            prev.token = token;
            win.localStorage.setItem('user', JSON.stringify(prev));
          } catch (e) {}
        } catch (e) {}
      }
    }).then(() => {
      // também adiciona cookie (algumas apps leem cookie)
      cy.setCookie('token', token);
      return cy.wrap(resp);
    });
  });
});
// ...existing code...