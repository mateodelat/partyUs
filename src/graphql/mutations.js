/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createUsuario = /* GraphQL */ `
  mutation CreateUsuario(
    $input: CreateUsuarioInput!
    $condition: ModelUsuarioConditionInput
  ) {
    createUsuario(input: $input, condition: $condition) {
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
export const updateUsuario = /* GraphQL */ `
  mutation UpdateUsuario(
    $input: UpdateUsuarioInput!
    $condition: ModelUsuarioConditionInput
  ) {
    updateUsuario(input: $input, condition: $condition) {
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
export const deleteUsuario = /* GraphQL */ `
  mutation DeleteUsuario(
    $input: DeleteUsuarioInput!
    $condition: ModelUsuarioConditionInput
  ) {
    deleteUsuario(input: $input, condition: $condition) {
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
export const createEvento = /* GraphQL */ `
  mutation CreateEvento(
    $input: CreateEventoInput!
    $condition: ModelEventoConditionInput
  ) {
    createEvento(input: $input, condition: $condition) {
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
export const updateEvento = /* GraphQL */ `
  mutation UpdateEvento(
    $input: UpdateEventoInput!
    $condition: ModelEventoConditionInput
  ) {
    updateEvento(input: $input, condition: $condition) {
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
export const deleteEvento = /* GraphQL */ `
  mutation DeleteEvento(
    $input: DeleteEventoInput!
    $condition: ModelEventoConditionInput
  ) {
    deleteEvento(input: $input, condition: $condition) {
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
export const createReserva = /* GraphQL */ `
  mutation CreateReserva(
    $input: CreateReservaInput!
    $condition: ModelReservaConditionInput
  ) {
    createReserva(input: $input, condition: $condition) {
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
export const updateReserva = /* GraphQL */ `
  mutation UpdateReserva(
    $input: UpdateReservaInput!
    $condition: ModelReservaConditionInput
  ) {
    updateReserva(input: $input, condition: $condition) {
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
export const deleteReserva = /* GraphQL */ `
  mutation DeleteReserva(
    $input: DeleteReservaInput!
    $condition: ModelReservaConditionInput
  ) {
    deleteReserva(input: $input, condition: $condition) {
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
