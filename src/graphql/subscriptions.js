/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateUsuario = /* GraphQL */ `
  subscription OnCreateUsuario($owner: String) {
    onCreateUsuario(owner: $owner) {
      id
      nickname
      nombre
      materno
      paterno
      email
      foto
      imagenFondo
      direccion
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
      userPaymentID
      verified
      owner
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
        }
        nextToken
        startedAt
      }
      Reservas {
        items {
          id
          total
          comision
          pagadoAlOrganizador
          cantidad
          pagado
          pagoID
          ingreso
          horaIngreso
          cancelado
          canceledAt
          cancelReason
          eventoID
          usuarioID
          cuponID
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
export const onUpdateUsuario = /* GraphQL */ `
  subscription OnUpdateUsuario($owner: String) {
    onUpdateUsuario(owner: $owner) {
      id
      nickname
      nombre
      materno
      paterno
      email
      foto
      imagenFondo
      direccion
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
      userPaymentID
      verified
      owner
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
        }
        nextToken
        startedAt
      }
      Reservas {
        items {
          id
          total
          comision
          pagadoAlOrganizador
          cantidad
          pagado
          pagoID
          ingreso
          horaIngreso
          cancelado
          canceledAt
          cancelReason
          eventoID
          usuarioID
          cuponID
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
export const onDeleteUsuario = /* GraphQL */ `
  subscription OnDeleteUsuario($owner: String) {
    onDeleteUsuario(owner: $owner) {
      id
      nickname
      nombre
      materno
      paterno
      email
      foto
      imagenFondo
      direccion
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
      userPaymentID
      verified
      owner
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
        }
        nextToken
        startedAt
      }
      Reservas {
        items {
          id
          total
          comision
          pagadoAlOrganizador
          cantidad
          pagado
          pagoID
          ingreso
          horaIngreso
          cancelado
          canceledAt
          cancelReason
          eventoID
          usuarioID
          cuponID
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
export const onCreateEvento = /* GraphQL */ `
  subscription OnCreateEvento($CreatorID: String) {
    onCreateEvento(CreatorID: $CreatorID) {
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
          comision
          pagadoAlOrganizador
          cantidad
          pagado
          pagoID
          ingreso
          horaIngreso
          cancelado
          canceledAt
          cancelReason
          eventoID
          usuarioID
          cuponID
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
export const onUpdateEvento = /* GraphQL */ `
  subscription OnUpdateEvento($CreatorID: String) {
    onUpdateEvento(CreatorID: $CreatorID) {
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
          comision
          pagadoAlOrganizador
          cantidad
          pagado
          pagoID
          ingreso
          horaIngreso
          cancelado
          canceledAt
          cancelReason
          eventoID
          usuarioID
          cuponID
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
export const onDeleteEvento = /* GraphQL */ `
  subscription OnDeleteEvento($CreatorID: String) {
    onDeleteEvento(CreatorID: $CreatorID) {
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
          comision
          pagadoAlOrganizador
          cantidad
          pagado
          pagoID
          ingreso
          horaIngreso
          cancelado
          canceledAt
          cancelReason
          eventoID
          usuarioID
          cuponID
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
export const onCreateNotificacion = /* GraphQL */ `
  subscription OnCreateNotificacion($usuarioID: String) {
    onCreateNotificacion(usuarioID: $usuarioID) {
      id
      tipo
      titulo
      descripcion
      usuarioID
      imagen
      leido
      showAt
      reservaID
      fechaID
      aventuraID
      guiaID
      solicitudGuiaID
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const onUpdateNotificacion = /* GraphQL */ `
  subscription OnUpdateNotificacion($usuarioID: String) {
    onUpdateNotificacion(usuarioID: $usuarioID) {
      id
      tipo
      titulo
      descripcion
      usuarioID
      imagen
      leido
      showAt
      reservaID
      fechaID
      aventuraID
      guiaID
      solicitudGuiaID
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const onDeleteNotificacion = /* GraphQL */ `
  subscription OnDeleteNotificacion($usuarioID: String) {
    onDeleteNotificacion(usuarioID: $usuarioID) {
      id
      tipo
      titulo
      descripcion
      usuarioID
      imagen
      leido
      showAt
      reservaID
      fechaID
      aventuraID
      guiaID
      solicitudGuiaID
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const onCreateBoleto = /* GraphQL */ `
  subscription OnCreateBoleto($owner: String) {
    onCreateBoleto(owner: $owner) {
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
          boletoID
          reservaID
          quantity
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
      owner
    }
  }
`;
export const onUpdateBoleto = /* GraphQL */ `
  subscription OnUpdateBoleto($owner: String) {
    onUpdateBoleto(owner: $owner) {
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
          boletoID
          reservaID
          quantity
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
      owner
    }
  }
`;
export const onDeleteBoleto = /* GraphQL */ `
  subscription OnDeleteBoleto($owner: String) {
    onDeleteBoleto(owner: $owner) {
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
          boletoID
          reservaID
          quantity
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
      owner
    }
  }
`;
export const onCreateCupon = /* GraphQL */ `
  subscription OnCreateCupon {
    onCreateCupon {
      id
      restantes
      vencimiento
      porcentajeDescuento
      cantidadDescuento
      Reservas {
        items {
          id
          total
          comision
          pagadoAlOrganizador
          cantidad
          pagado
          pagoID
          ingreso
          horaIngreso
          cancelado
          canceledAt
          cancelReason
          eventoID
          usuarioID
          cuponID
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
export const onUpdateCupon = /* GraphQL */ `
  subscription OnUpdateCupon {
    onUpdateCupon {
      id
      restantes
      vencimiento
      porcentajeDescuento
      cantidadDescuento
      Reservas {
        items {
          id
          total
          comision
          pagadoAlOrganizador
          cantidad
          pagado
          pagoID
          ingreso
          horaIngreso
          cancelado
          canceledAt
          cancelReason
          eventoID
          usuarioID
          cuponID
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
export const onDeleteCupon = /* GraphQL */ `
  subscription OnDeleteCupon {
    onDeleteCupon {
      id
      restantes
      vencimiento
      porcentajeDescuento
      cantidadDescuento
      Reservas {
        items {
          id
          total
          comision
          pagadoAlOrganizador
          cantidad
          pagado
          pagoID
          ingreso
          horaIngreso
          cancelado
          canceledAt
          cancelReason
          eventoID
          usuarioID
          cuponID
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
export const onCreateReserva = /* GraphQL */ `
  subscription OnCreateReserva {
    onCreateReserva {
      id
      total
      comision
      pagadoAlOrganizador
      cantidad
      pagado
      pagoID
      ingreso
      horaIngreso
      cancelado
      canceledAt
      cancelReason
      eventoID
      usuarioID
      cuponID
      Boletos {
        items {
          id
          boletoID
          reservaID
          quantity
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      organizadorID
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const onUpdateReserva = /* GraphQL */ `
  subscription OnUpdateReserva {
    onUpdateReserva {
      id
      total
      comision
      pagadoAlOrganizador
      cantidad
      pagado
      pagoID
      ingreso
      horaIngreso
      cancelado
      canceledAt
      cancelReason
      eventoID
      usuarioID
      cuponID
      Boletos {
        items {
          id
          boletoID
          reservaID
          quantity
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      organizadorID
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const onDeleteReserva = /* GraphQL */ `
  subscription OnDeleteReserva {
    onDeleteReserva {
      id
      total
      comision
      pagadoAlOrganizador
      cantidad
      pagado
      pagoID
      ingreso
      horaIngreso
      cancelado
      canceledAt
      cancelReason
      eventoID
      usuarioID
      cuponID
      Boletos {
        items {
          id
          boletoID
          reservaID
          quantity
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        nextToken
        startedAt
      }
      organizadorID
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const onCreateReservasBoletos = /* GraphQL */ `
  subscription OnCreateReservasBoletos {
    onCreateReservasBoletos {
      id
      boletoID
      reservaID
      quantity
      reserva {
        id
        total
        comision
        pagadoAlOrganizador
        cantidad
        pagado
        pagoID
        ingreso
        horaIngreso
        cancelado
        canceledAt
        cancelReason
        eventoID
        usuarioID
        cuponID
        Boletos {
          nextToken
          startedAt
        }
        organizadorID
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
      }
      boleto {
        id
        titulo
        descripcion
        cantidad
        personasReservadas
        precio
        eventoID
        Reservas {
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
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const onUpdateReservasBoletos = /* GraphQL */ `
  subscription OnUpdateReservasBoletos {
    onUpdateReservasBoletos {
      id
      boletoID
      reservaID
      quantity
      reserva {
        id
        total
        comision
        pagadoAlOrganizador
        cantidad
        pagado
        pagoID
        ingreso
        horaIngreso
        cancelado
        canceledAt
        cancelReason
        eventoID
        usuarioID
        cuponID
        Boletos {
          nextToken
          startedAt
        }
        organizadorID
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
      }
      boleto {
        id
        titulo
        descripcion
        cantidad
        personasReservadas
        precio
        eventoID
        Reservas {
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
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const onDeleteReservasBoletos = /* GraphQL */ `
  subscription OnDeleteReservasBoletos {
    onDeleteReservasBoletos {
      id
      boletoID
      reservaID
      quantity
      reserva {
        id
        total
        comision
        pagadoAlOrganizador
        cantidad
        pagado
        pagoID
        ingreso
        horaIngreso
        cancelado
        canceledAt
        cancelReason
        eventoID
        usuarioID
        cuponID
        Boletos {
          nextToken
          startedAt
        }
        organizadorID
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
      }
      boleto {
        id
        titulo
        descripcion
        cantidad
        personasReservadas
        precio
        eventoID
        Reservas {
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
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
