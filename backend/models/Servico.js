class Servico {
  constructor(data) {
    this.id = data.id;
    this.nome = data.nome;
    this.descricao = data.descricao;
    this.preco_base = data.preco_base;
    this.duracao_estimada = data.duracao_estimada; // em minutos
    this.categoria = data.categoria;
    this.ativo = data.ativo !== undefined ? data.ativo : true;
    this.data_cadastro = data.data_cadastro;
  }

  // Categorias de serviço
  static get CATEGORIAS() {
    return {
      TATUAGEM_PEQUENA: 'tatuagem_pequena',
      TATUAGEM_MEDIA: 'tatuagem_media',
      TATUAGEM_GRANDE: 'tatuagem_grande',
      RETOQUE: 'retoque',
      COVER_UP: 'cover_up',
      PIERCING: 'piercing',
      REMOCAO: 'remocao',
      CONSULTA: 'consulta'
    };
  }

  // Validações
  static validate(data) {
    const errors = [];

    if (!data.nome || data.nome.trim().length < 2) {
      errors.push('Nome do serviço deve ter pelo menos 2 caracteres');
    }

    if (!data.descricao || data.descricao.trim().length < 5) {
      errors.push('Descrição deve ter pelo menos 5 caracteres');
    }

    if (!data.preco_base || isNaN(data.preco_base) || data.preco_base < 0) {
      errors.push('Preço base deve ser um número válido e maior que zero');
    }

    if (!data.duracao_estimada || isNaN(data.duracao_estimada) || data.duracao_estimada < 1) {
      errors.push('Duração estimada deve ser um número válido em minutos');
    }

    if (data.categoria && !Object.values(this.CATEGORIAS).includes(data.categoria)) {
      errors.push('Categoria inválida');
    }

    return errors;
  }

  // Método para calcular preço com base na duração
  calcularPreco(duracaoReal = null) {
    if (duracaoReal && duracaoReal > this.duracao_estimada) {
      const tempoExtra = duracaoReal - this.duracao_estimada;
      const precoExtra = (tempoExtra / 60) * (this.preco_base * 0.5); // 50% do preço base por hora extra
      return this.preco_base + precoExtra;
    }
    return this.preco_base;
  }

  // Método para obter dados do serviço para resposta da API
  toJSON() {
    return {
      id: this.id,
      nome: this.nome,
      descricao: this.descricao,
      preco_base: this.preco_base,
      duracao_estimada: this.duracao_estimada,
      categoria: this.categoria,
      ativo: this.ativo,
      data_cadastro: this.data_cadastro
    };
  }
}

module.exports = Servico;
