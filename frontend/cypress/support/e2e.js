// Importa comandos customizados (crie o arquivo commands.js abaixo) e configurações globais.
import './commands';

// Exemplo de configuração global (opcional)
Cypress.on('uncaught:exception', (err, runnable) => {
  // evita falha do teste por exceções não tratadas do app
  return false;
});