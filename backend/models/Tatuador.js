class Tatuador {
  constructor(data) {
    this.id = data.id;
    this.nome = data.nome;
    this.email = data.email;
    this.telefone = data.telefone;
    this.cpf = data.cpf;
    this.especialidades = data.especialidades;
    this.biografia = data.biografia;
    this.portfolio_url = data.portfolio_url;
    this.instagram = data.instagram;
    this.valor_hora = data.valor_hora;
    this.disponibilidade = data.disponibilidade;
    this.senha = data.senha;
    this.data_cadastro = data.data_cadastro;
    this.ativo = data.ativo !== undefined ? data.ativo : true;
  }

  // Validações
  static validate(data) {
    const errors = [];

    if (!data.nome || data.nome.trim().length < 2) {
      errors.push('Nome deve ter pelo menos 2 caracteres');
    }

    if (!data.email || !this.isValidEmail(data.email)) {
      errors.push('Email inválido');
    }

    if (!data.telefone || data.telefone.length < 10) {
      errors.push('Telefone inválido');
    }

    if (data.valor_hora && (isNaN(data.valor_hora) || data.valor_hora < 0)) {
      errors.push('Valor por hora deve ser um número válido');
    }

    return errors;
  }

  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Método para obter dados do tatuador para resposta da API
  toJSON() {
    return {
      id: this.id,
      nome: this.nome,
      email: this.email,
      telefone: this.telefone,
      cpf: this.cpf,
      especialidades: this.especialidades,
      biografia: this.biografia,
      portfolio_url: this.portfolio_url,
      instagram: this.instagram,
      valor_hora: this.valor_hora,
      disponibilidade: this.disponibilidade,
      data_cadastro: this.data_cadastro,
      ativo: this.ativo
      // Não retorna senha
    };
  }
}

module.exports = Tatuador;
