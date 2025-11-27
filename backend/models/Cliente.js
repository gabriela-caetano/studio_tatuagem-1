class Cliente {
  constructor(data) {
    this.id = data.id;
    this.nome = data.nome;
    this.email = data.email;
    this.telefone = data.telefone;
    this.cpf = data.cpf;
    this.data_nascimento = data.data_nascimento;
    this.endereco = data.endereco;
    this.cidade = data.cidade;
    this.estado = data.estado;
    this.cep = data.cep;
    this.observacoes = data.observacoes;
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

    if (!data.cpf || !this.isValidCPF(data.cpf)) {
      errors.push('CPF inválido');
    }

    return errors;
  }

  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isValidCPF(cpf) {
    cpf = cpf.replace(/[^\d]/g, '');
    if (cpf.length !== 11) return false;
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cpf)) return false;
    
    // Validação do CPF
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let digit = 11 - (sum % 11);
    if (digit === 10 || digit === 11) digit = 0;
    if (digit !== parseInt(cpf.charAt(9))) return false;
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    digit = 11 - (sum % 11);
    if (digit === 10 || digit === 11) digit = 0;
    if (digit !== parseInt(cpf.charAt(10))) return false;
    
    return true;
  }

  // Método para obter dados do cliente para resposta da API
  toJSON() {
    return {
      id: this.id,
      nome: this.nome,
      email: this.email,
      telefone: this.telefone,
      cpf: this.cpf,
      data_nascimento: this.data_nascimento,
      endereco: this.endereco,
      cidade: this.cidade,
      estado: this.estado,
      cep: this.cep,
      observacoes: this.observacoes,
      data_cadastro: this.data_cadastro,
      ativo: this.ativo
    };
  }
}

module.exports = Cliente;
