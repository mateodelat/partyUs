/* eslint-disable */
// this is an auto generated file. This will be overwritten

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
      verified
      Eventos {
        items {
          id
          imagenes
          imagenPrincipalIDX
          titulo
          detalles
          ubicacion
          fechaInicial
          fechaFinal
          tosAceptance
          tipoLugar
          musica
          comodities
          musOtra
          personasReservadas
          personasMax
          precioMin
          precioMax
          CreatorID
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
          owner
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
          boletoID
          cuponID
          organizadorID
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
          owner
        }
        nextToken
        startedAt
      }
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      owner
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
      verified
      Eventos {
        items {
          id
          imagenes
          imagenPrincipalIDX
          titulo
          detalles
          ubicacion
          fechaInicial
          fechaFinal
          tosAceptance
          tipoLugar
          musica
          comodities
          musOtra
          personasReservadas
          personasMax
          precioMin
          precioMax
          CreatorID
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
          owner
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
          boletoID
          cuponID
          organizadorID
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
          owner
        }
        nextToken
        startedAt
      }
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      owner
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
      imagenPrincipalIDX
      titulo
      detalles
      ubicacion
      fechaInicial
      fechaFinal
      tosAceptance
      tipoLugar
      musica
      comodities
      musOtra
      personasReservadas
      personasMax
      precioMin
      precioMax
      CreatorID
      Boletos {
        items {
          id
          titulo
          descripcion
          cantidad
          personasReservadas
          precio
          eventoID
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
          owner
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
          boletoID
          cuponID
          organizadorID
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
          owner
        }
        nextToken
        startedAt
      }
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      owner
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
      imagenPrincipalIDX
      titulo
      detalles
      ubicacion
      fechaInicial
      fechaFinal
      tosAceptance
      tipoLugar
      musica
      comodities
      musOtra
      personasReservadas
      personasMax
      precioMin
      precioMax
      CreatorID
      Boletos {
        items {
          id
          titulo
          descripcion
          cantidad
          personasReservadas
          precio
          eventoID
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
          owner
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
          boletoID
          cuponID
          organizadorID
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
          owner
        }
        nextToken
        startedAt
      }
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      owner
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
      imagenPrincipalIDX
      titulo
      detalles
      ubicacion
      fechaInicial
      fechaFinal
      tosAceptance
      tipoLugar
      musica
      comodities
      musOtra
      personasReservadas
      personasMax
      precioMin
      precioMax
      CreatorID
      Boletos {
        items {
          id
          titulo
          descripcion
          cantidad
          personasReservadas
          precio
          eventoID
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
          owner
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
          boletoID
          cuponID
          organizadorID
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
          owner
        }
        nextToken
        startedAt
      }
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      owner
    }
  }
`;
export const createBoleto = /* GraphQL */ `
  mutation CreateBoleto(
    $input: CreateBoletoInput!
    $condition: ModelBoletoConditionInput
  ) {
    createBoleto(input: $input, condition: $condition) {
      id
      titulo
      descripcion
      cantidad
      personasReservadas
      precio
      eventoID
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
          boletoID
          cuponID
          organizadorID
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
          owner
        }
        nextToken
        startedAt
      }
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      owner
    }
  }
`;
export const updateBoleto = /* GraphQL */ `
  mutation UpdateBoleto(
    $input: UpdateBoletoInput!
    $condition: ModelBoletoConditionInput
  ) {
    updateBoleto(input: $input, condition: $condition) {
      id
      titulo
      descripcion
      cantidad
      personasReservadas
      precio
      eventoID
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
          boletoID
          cuponID
          organizadorID
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
          owner
        }
        nextToken
        startedAt
      }
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      owner
    }
  }
`;
export const deleteBoleto = /* GraphQL */ `
  mutation DeleteBoleto(
    $input: DeleteBoletoInput!
    $condition: ModelBoletoConditionInput
  ) {
    deleteBoleto(input: $input, condition: $condition) {
      id
      titulo
      descripcion
      cantidad
      personasReservadas
      precio
      eventoID
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
          boletoID
          cuponID
          organizadorID
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
          owner
        }
        nextToken
        startedAt
      }
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      owner
    }
  }
`;
export const createCupon = /* GraphQL */ `
  mutation CreateCupon(
    $input: CreateCuponInput!
    $condition: ModelCuponConditionInput
  ) {
    createCupon(input: $input, condition: $condition) {
      id
      restantes
      vencimiento
      porcentajeDescuento
      cantidadDescuento
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
          boletoID
          cuponID
          organizadorID
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
          owner
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
export const updateCupon = /* GraphQL */ `
  mutation UpdateCupon(
    $input: UpdateCuponInput!
    $condition: ModelCuponConditionInput
  ) {
    updateCupon(input: $input, condition: $condition) {
      id
      restantes
      vencimiento
      porcentajeDescuento
      cantidadDescuento
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
          boletoID
          cuponID
          organizadorID
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
          owner
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
export const deleteCupon = /* GraphQL */ `
  mutation DeleteCupon(
    $input: DeleteCuponInput!
    $condition: ModelCuponConditionInput
  ) {
    deleteCupon(input: $input, condition: $condition) {
      id
      restantes
      vencimiento
      porcentajeDescuento
      cantidadDescuento
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
          boletoID
          cuponID
          organizadorID
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
          owner
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
      boletoID
      cuponID
      organizadorID
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      owner
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
      boletoID
      cuponID
      organizadorID
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      owner
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
      boletoID
      cuponID
      organizadorID
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      owner
    }
  }
`;
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
      verified
      Eventos {
        items {
          id
          imagenes
          imagenPrincipalIDX
          titulo
          detalles
          ubicacion
          fechaInicial
          fechaFinal
          tosAceptance
          tipoLugar
          musica
          comodities
          musOtra
          personasReservadas
          personasMax
          precioMin
          precioMax
          CreatorID
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
          owner
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
          boletoID
          cuponID
          organizadorID
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
          owner
        }
        nextToken
        startedAt
      }
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      owner
    }
  }
`;
