/**
 * Helper para gerenciar navegação e persistência de estado
 * Controla quando limpar ou manter filtros/paginação baseado no histórico
 */

const NAVIGATION_HISTORY_KEY = 'app_navigation_history';

/**
 * Tipos de navegação que determinam se deve limpar storage
 */
const NAVIGATION_TYPES = {
  MENU: 'menu',           // Vindo de menu/navbar/sidebar - LIMPA
  FORM_VIEW: 'form_view', // Visualizar item - MANTÉM
  FORM_EDIT: 'form_edit', // Editar item - MANTÉM
  FORM_NEW: 'form_new',   // Novo item - MANTÉM
  FORM_SAVE: 'form_save', // Salvou formulário - LIMPA
  INTERNAL: 'internal'    // Navegação interna (paginação/filtros) - MANTÉM
};

/**
 * Salva o histórico de navegação
 */
export const saveNavigationHistory = (from, to, type) => {
  const history = {
    from,
    to,
    type,
    timestamp: new Date().toISOString()
  };
  sessionStorage.setItem(NAVIGATION_HISTORY_KEY, JSON.stringify(history));
};

/**
 * Recupera o histórico de navegação
 */
export const getNavigationHistory = () => {
  const history = sessionStorage.getItem(NAVIGATION_HISTORY_KEY);
  if (history) {
    try {
      const parsed = JSON.parse(history);
      return parsed;
    } catch (e) {
      console.error('[NAVIGATION] Erro ao parsear histórico:', e);
      return null;
    }
  }
  return null;
};

/**
 * Limpa o histórico de navegação
 */
export const clearNavigationHistory = () => {
  sessionStorage.removeItem(NAVIGATION_HISTORY_KEY);
};

/**
 * Verifica se deve limpar o storage baseado no histórico
 */
export const shouldClearStorage = (currentRoute) => {
  const history = getNavigationHistory();
  
  if (!history) {
    // Primeira vez na página - não limpar
    return false;
  }
  
  // Se o destino não é a rota atual, não processar
  if (history.to !== currentRoute) {
    return false;
  }
  
  // Decisão baseada no tipo de navegação
  switch (history.type) {
    case NAVIGATION_TYPES.MENU:
      // Vindo de menu - LIMPA
      return true;
    
    case NAVIGATION_TYPES.FORM_SAVE:
      // Salvou formulário - LIMPA
      return true;
    
    case NAVIGATION_TYPES.FORM_VIEW:
    case NAVIGATION_TYPES.FORM_EDIT:
    case NAVIGATION_TYPES.FORM_NEW:
    case NAVIGATION_TYPES.INTERNAL:
    default:
      // Navegação interna - MANTÉM
      return false;
  }
};

/**
 * Hook para navegação de menu (Navbar/Sidebar)
 */
export const navigateFromMenu = (navigate, route) => {
  saveNavigationHistory(window.location.pathname, route, NAVIGATION_TYPES.MENU);
  navigate(route);
};

/**
 * Hook para navegação de formulário - visualizar
 */
export const navigateToView = (navigate, route) => {
  saveNavigationHistory(window.location.pathname, route, NAVIGATION_TYPES.FORM_VIEW);
  navigate(route);
};

/**
 * Hook para navegação de formulário - editar
 */
export const navigateToEdit = (navigate, route) => {
  saveNavigationHistory(window.location.pathname, route, NAVIGATION_TYPES.FORM_EDIT);
  navigate(route);
};

/**
 * Hook para navegação de formulário - novo
 */
export const navigateToNew = (navigate, route) => {
  saveNavigationHistory(window.location.pathname, route, NAVIGATION_TYPES.FORM_NEW);
  navigate(route);
};

/**
 * Hook para navegação após salvar formulário
 */
export const navigateAfterSave = (navigate, route) => {
  saveNavigationHistory(window.location.pathname, route, NAVIGATION_TYPES.FORM_SAVE);
  navigate(route);
};

/**
 * Hook para voltar de formulário (cancelar/voltar)
 * Sempre volta para a listagem mantendo o estado
 */
export const navigateBack = (navigate, defaultRoute) => {
  const history = getNavigationHistory();
  
  // Se temos histórico e o from é a rota da listagem, voltar para lá
  if (history && history.from) {
    // Verificar se o from é uma rota de listagem (não é um formulário)
    const isListingRoute = !history.from.includes('/novo') && 
                           !history.from.includes('/editar') && 
                           !history.from.match(/\/\d+$/);
    
    if (isListingRoute) {
      // Voltar para a listagem mantendo estado (INTERNAL)
      saveNavigationHistory(window.location.pathname, history.from, NAVIGATION_TYPES.INTERNAL);
      navigate(history.from);
      return;
    }
  }
  
  // Fallback: ir para rota padrão mantendo estado
  saveNavigationHistory(window.location.pathname, defaultRoute, NAVIGATION_TYPES.INTERNAL);
  navigate(defaultRoute);
};

export { NAVIGATION_TYPES };
