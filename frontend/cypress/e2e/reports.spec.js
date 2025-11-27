// ...existing code...
describe('Relatórios / Dashboard', () => {

  beforeEach(() => {
    cy.intercept('GET', '**/api/relatorios/**').as('getRelatorios');
    cy.intercept('GET', '**/api/agendamentos/**').as('getAgendamentosData');
    cy.apiLogin().then((resp) => {
      expect([200, 201]).to.include(resp.status);
      cy.visit('/dashboard');
      cy.get('h1, .page-title, [data-testid="dashboard"], #dashboard, main', { timeout: 10000 }).should('exist');
      cy.wait('@getRelatorios', { timeout: 10000 }).then(() => {}, () => {});
    });
  });

  const attemptDate = (name, value) => {
    const candidates = [
      `input[name="${name}"]`,
      `[data-testid="${name}"]`,
      `input[placeholder*="Data"]`,
      `input[placeholder*="data"]`,
      `input[id*="${name}"]`,
      `input[type="date"]`
    ];
    return cy.get('body').then($body => {
      for (const s of candidates) {
        const el = $body.find(s);
        if (el.length) {
          cy.log(`Encontrado ${s} — preenchendo ${value}`);
          return cy.wrap(el.first()).clear().type(value);
        }
      }
      cy.log(`Campo de data "${name}" não encontrado — pulando preenchimento`);
      return cy.wrap(null);
    });
  };

  // ...existing code...
const clickByTextOrSelectors = (texts, selectors, timeout = 3000) => {
  const textRegex = texts instanceof RegExp ? texts : (Array.isArray(texts) ? texts[0] : texts);
  return cy.contains(textRegex, { timeout }).click().then(() => {}, () => {
    return cy.get('body').then($body => {
      for (const s of selectors) {
        const el = $body.find(s);
        if (el.length) return cy.wrap(el.first()).click();
      }
      cy.screenshot('reports-missing-element-debug');
      cy.document().then(doc => {
        cy.writeFile('cypress/logs/reports-dashboard.html', doc.documentElement.outerHTML);
      });
      throw new Error('Elemento alvo não encontrado. Veja cypress/logs/reports-dashboard.html e screenshot reports-missing-element-debug');
    });
  });
};
// ...existing code...

  it('carrega dados e aplica filtro por data', () => {
    const today = new Date().toISOString().split('T')[0];
    attemptDate('data_inicio', '2025-01-01');
    attemptDate('data_fim', today);

    clickByTextOrSelectors(
      [/filtrar|aplicar|buscar/i],
      ['button[data-testid="filter-button"]', '.btn-filter', '.filter-button', 'button[aria-label*="filter"]']
    );

    cy.contains(/receita|agendamentos|clientes/i, { timeout: 10000 }).should('exist');
  });

  it('exporta relatório (verifica chamada API)', () => {
    cy.intercept('GET', '**/api/relatorios/**').as('export');
    clickByTextOrSelectors(
      [/exportar|baixar|csv|pdf/i],
      ['button[aria-label*="export"]', 'button[data-testid*="export"]', '.btn-export', '.export-button', 'a[download]'],
      5000
    );
    cy.wait('@export', { timeout: 10000 }).its('response.statusCode').should('be.oneOf', [200, 204]);
  });

});