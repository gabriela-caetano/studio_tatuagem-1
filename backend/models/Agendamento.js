class Agendamento {
  constructor(data) {
    this.id = data.id;
    this.cliente_id = data.cliente_id;
    this.tatuador_id = data.tatuador_id;
    this.servico_id = data.servico_id;
    this.data_agendamento = data.data_agendamento;
    this.hora_inicio = data.hora_inicio;
    this.hora_fim = data.hora_fim;
    this.descricao_tatuagem = data.descricao_tatuagem;
    this.valor_estimado = data.valor_estimado;
    this.valor_final = data.valor_final;
    this.status = data.status || 'agendado';
    this.observacoes = data.observacoes;
    this.data_cadastro = data.data_cadastro;
    this.data_atualizacao = data.data_atualizacao;
  }

  // Status possíveis
  static get STATUS() {
    return {
      AGENDADO: 'agendado',
      CONFIRMADO: 'confirmado',
      EM_ANDAMENTO: 'em_andamento',
      CONCLUIDO: 'concluido',
      CANCELADO: 'cancelado',
      REAGENDADO: 'reagendado'
    };
  }

  // Validações
  static validate(data) {
    const errors = [];

    if (!data.cliente_id || isNaN(data.cliente_id)) {
      errors.push('Cliente ID é obrigatório e deve ser um número válido');
    }

    if (!data.tatuador_id || isNaN(data.tatuador_id)) {
      errors.push('Tatuador ID é obrigatório e deve ser um número válido');
    }

    if (!data.data_agendamento) {
      errors.push('Data do agendamento é obrigatória');
    }

    if (!data.hora_inicio) {
      errors.push('Hora de início é obrigatória');
    }

    if (!data.descricao_tatuagem || data.descricao_tatuagem.trim().length < 5) {
      errors.push('Descrição da tatuagem deve ter pelo menos 5 caracteres');
    }

    if (data.valor_estimado && (isNaN(data.valor_estimado) || data.valor_estimado < 0)) {
      errors.push('Valor estimado deve ser um número válido');
    }

    if (data.valor_final && (isNaN(data.valor_final) || data.valor_final < 0)) {
      errors.push('Valor final deve ser um número válido');
    }

    if (data.status && !Object.values(this.STATUS).includes(data.status)) {
      errors.push('Status inválido');
    }

    // Validar se a data não é no passado (considerar hora de fim se fornecida)
    if (data.data_agendamento && data.hora_fim) {
      const dataHoraFim = new Date(`${data.data_agendamento}T${data.hora_fim}`);
      const agora = new Date();
      
      if (dataHoraFim < agora) {
        errors.push('Data do agendamento não pode ser no passado');
      }
    } else if (data.data_agendamento) {
      // Se não tiver hora_fim, comparar só a data
      const dataAgendamento = new Date(data.data_agendamento);
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      dataAgendamento.setHours(0, 0, 0, 0);
      
      if (dataAgendamento < hoje) {
        errors.push('Data do agendamento não pode ser no passado');
      }
    }

    return errors;
  }

  // Método para verificar se o agendamento pode ser alterado
  podeSerAlterado() {
    return [
      Agendamento.STATUS.AGENDADO,
      Agendamento.STATUS.CONFIRMADO
    ].includes(this.status);
  }

  // Método para verificar se o agendamento pode ser cancelado
  podeSerCancelado() {
    return [
      Agendamento.STATUS.AGENDADO,
      Agendamento.STATUS.CONFIRMADO
    ].includes(this.status);
  }

  // Método para obter dados do agendamento para resposta da API
  toJSON() {
    return {
      id: this.id,
      cliente_id: this.cliente_id,
      tatuador_id: this.tatuador_id,
      servico_id: this.servico_id,
      data_agendamento: this.data_agendamento,
      hora_inicio: this.hora_inicio,
      hora_fim: this.hora_fim,
      descricao_tatuagem: this.descricao_tatuagem,
      valor_estimado: this.valor_estimado,
      valor_final: this.valor_final,
      status: this.status,
      observacoes: this.observacoes,
      data_cadastro: this.data_cadastro,
      data_atualizacao: this.data_atualizacao
    };
  }
}

module.exports = Agendamento;
