/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getUsuario = /* GraphQL */ `
  query GetUsuario($id: ID!) {
    getUsuario(id: $id) {
      id
      nickname
      nombre
      materno
      paterno
      email
      foto
      imagenFondo
      phoneNumber
      phoneCode
      organizador
      admin
      idUploaded
      idData
      idKey
      fechaNacimiento
      calificacion
      numResenas
      notificationToken
      Eventos {
        items {
          id
          imagenes
          titulo
          detalles
          ubicacion
          fechaInicial
          fechaFinal
          boletos
          tosAceptance
          tipoLugar
          musica
          comodities
          musOtra
          CreatorID
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      Reservas {
        items {
          id
          total
          precioIndividual
          comision
          pagadoAlOrganizador
          tituloBoleto
          descripcionBoleto
          cantidad
          pagoID
          ingreso
          horaIngreso
          cancelado
          canceledAt
          cancelReason
          eventoID
          usuarioID
          organizadorID
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const listUsuarios = /* GraphQL */ `
  query ListUsuarios(
    $filter: ModelUsuarioFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listUsuarios(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        nickname
        nombre
        materno
        paterno
        email
        foto
        imagenFondo
        phoneNumber
        phoneCode
        organizador
        admin
        idUploaded
        idData
        idKey
        fechaNacimiento
        calificacion
        numResenas
        notificationToken
        Eventos {
          nextToken
          startedAt
        }
        Reservas {
          nextToken
          startedAt
        }
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
      }
      nextToken
      startedAt
    }
  }
`;
export const syncUsuarios = /* GraphQL */ `
  query SyncUsuarios(
    $filter: ModelUsuarioFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncUsuarios(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
      items {
        id
        nickname
        nombre
        materno
        paterno
        email
        foto
        imagenFondo
        phoneNumber
        phoneCode
        organizador
        admin
        idUploaded
        idData
        idKey
        fechaNacimiento
        calificacion
        numResenas
        notificationToken
        Eventos {
          nextToken
          startedAt
        }
        Reservas {
          nextToken
          startedAt
        }
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
      }
      nextToken
      startedAt
    }
  }
`;
export const getEvento = /* GraphQL */ `
  query GetEvento($id: ID!) {
    getEvento(id: $id) {
      id
      imagenes
      titulo
      detalles
      ubicacion
      fechaInicial
      fechaFinal
      boletos
      tosAceptance
      tipoLugar
      musica
      comodities
      musOtra
      CreatorID
      Creator {
        id
        nickname
        nombre
        materno
        paterno
        email
        foto
        imagenFondo
        phoneNumber
        phoneCode
        organizador
        admin
        idUploaded
        idData
        idKey
        fechaNacimiento
        calificacion
        numResenas
        notificationToken
        Eventos {
          nextToken
          startedAt
        }
        Reservas {
          nextToken
          startedAt
        }
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
      }
      Reservas {
        items {
          id
          total
          precioIndividual
          comision
          pagadoAlOrganizador
          tituloBoleto
          descripcionBoleto
          cantidad
          pagoID
          ingreso
          horaIngreso
          cancelado
          canceledAt
          cancelReason
          eventoID
          usuarioID
          organizadorID
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const listEventos = /* GraphQL */ `
  query ListEventos(
    $filter: ModelEventoFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listEventos(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        imagenes
        titulo
        detalles
        ubicacion
        fechaInicial
        fechaFinal
        boletos
        tosAceptance
        tipoLugar
        musica
        comodities
        musOtra
        CreatorID
        Creator {
          id
          nickname
          nombre
          materno
          paterno
          email
          foto
          imagenFondo
          phoneNumber
          phoneCode
          organizador
          admin
          idUploaded
          idData
          idKey
          fechaNacimiento
          calificacion
          numResenas
          notificationToken
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        Reservas {
          nextToken
          startedAt
        }
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
      }
      nextToken
      startedAt
    }
  }
`;
export const syncEventos = /* GraphQL */ `
  query SyncEventos(
    $filter: ModelEventoFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncEventos(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
      items {
        id
        imagenes
        titulo
        detalles
        ubicacion
        fechaInicial
        fechaFinal
        boletos
        tosAceptance
        tipoLugar
        musica
        comodities
        musOtra
        CreatorID
        Creator {
          id
          nickname
          nombre
          materno
          paterno
          email
          foto
          imagenFondo
          phoneNumber
          phoneCode
          organizador
          admin
          idUploaded
          idData
          idKey
          fechaNacimiento
          calificacion
          numResenas
          notificationToken
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        Reservas {
          nextToken
          startedAt
        }
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
      }
      nextToken
      startedAt
    }
  }
`;
export const getReserva = /* GraphQL */ `
  query GetReserva($id: ID!) {
    getReserva(id: $id) {
      id
      total
      precioIndividual
      comision
      pagadoAlOrganizador
      tituloBoleto
      descripcionBoleto
      cantidad
      pagoID
      ingreso
      horaIngreso
      cancelado
      canceledAt
      cancelReason
      eventoID
      usuarioID
      organizadorID
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const listReservas = /* GraphQL */ `
  query ListReservas(
    $filter: ModelReservaFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listReservas(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        total
        precioIndividual
        comision
        pagadoAlOrganizador
        tituloBoleto
        descripcionBoleto
        cantidad
        pagoID
        ingreso
        horaIngreso
        cancelado
        canceledAt
        cancelReason
        eventoID
        usuarioID
        organizadorID
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
      }
      nextToken
      startedAt
    }
  }
`;
export const syncReservas = /* GraphQL */ `
  query SyncReservas(
    $filter: ModelReservaFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncReservas(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
      items {
        id
        total
        precioIndividual
        comision
        pagadoAlOrganizador
        tituloBoleto
        descripcionBoleto
        cantidad
        pagoID
        ingreso
        horaIngreso
        cancelado
        canceledAt
        cancelReason
        eventoID
        usuarioID
        organizadorID
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
      }
      nextToken
      startedAt
    }
  }
`;
