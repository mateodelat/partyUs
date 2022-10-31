/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateUsuario = /* GraphQL */ `
  subscription OnCreateUsuario(
    $filter: ModelSubscriptionUsuarioFilterInput
    $owner: String
  ) {
    onCreateUsuario(filter: $filter, owner: $owner) {
      id
      nickname
      nombre
      materno
      paterno
      email
      foto
      cuentaBancaria
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
          paymentTime
          tipoPago
          chargeID
          transactionID
          feeID
          cashBarcode
          cashReference
          ingreso
          horaIngreso
          cancelado
          canceledAt
          cancelReason
          fechaExpiracionUTC
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
  subscription OnUpdateUsuario(
    $filter: ModelSubscriptionUsuarioFilterInput
    $owner: String
  ) {
    onUpdateUsuario(filter: $filter, owner: $owner) {
      id
      nickname
      nombre
      materno
      paterno
      email
      foto
      cuentaBancaria
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
          paymentTime
          tipoPago
          chargeID
          transactionID
          feeID
          cashBarcode
          cashReference
          ingreso
          horaIngreso
          cancelado
          canceledAt
          cancelReason
          fechaExpiracionUTC
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
  subscription OnDeleteUsuario(
    $filter: ModelSubscriptionUsuarioFilterInput
    $owner: String
  ) {
    onDeleteUsuario(filter: $filter, owner: $owner) {
      id
      nickname
      nombre
      materno
      paterno
      email
      foto
      cuentaBancaria
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
          paymentTime
          tipoPago
          chargeID
          transactionID
          feeID
          cashBarcode
          cashReference
          ingreso
          horaIngreso
          cancelado
          canceledAt
          cancelReason
          fechaExpiracionUTC
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
  subscription OnCreateEvento(
    $filter: ModelSubscriptionEventoFilterInput
    $CreatorID: String
  ) {
    onCreateEvento(filter: $filter, CreatorID: $CreatorID) {
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
      creator {
        id
        nickname
        nombre
        materno
        paterno
        email
        foto
        cuentaBancaria
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
          paymentTime
          tipoPago
          chargeID
          transactionID
          feeID
          cashBarcode
          cashReference
          ingreso
          horaIngreso
          cancelado
          canceledAt
          cancelReason
          fechaExpiracionUTC
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
  subscription OnUpdateEvento(
    $filter: ModelSubscriptionEventoFilterInput
    $CreatorID: String
  ) {
    onUpdateEvento(filter: $filter, CreatorID: $CreatorID) {
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
      creator {
        id
        nickname
        nombre
        materno
        paterno
        email
        foto
        cuentaBancaria
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
          paymentTime
          tipoPago
          chargeID
          transactionID
          feeID
          cashBarcode
          cashReference
          ingreso
          horaIngreso
          cancelado
          canceledAt
          cancelReason
          fechaExpiracionUTC
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
  subscription OnDeleteEvento(
    $filter: ModelSubscriptionEventoFilterInput
    $CreatorID: String
  ) {
    onDeleteEvento(filter: $filter, CreatorID: $CreatorID) {
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
      creator {
        id
        nickname
        nombre
        materno
        paterno
        email
        foto
        cuentaBancaria
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
          paymentTime
          tipoPago
          chargeID
          transactionID
          feeID
          cashBarcode
          cashReference
          ingreso
          horaIngreso
          cancelado
          canceledAt
          cancelReason
          fechaExpiracionUTC
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
  subscription OnCreateNotificacion(
    $filter: ModelSubscriptionNotificacionFilterInput
    $usuarioID: String
  ) {
    onCreateNotificacion(filter: $filter, usuarioID: $usuarioID) {
      id
      tipo
      titulo
      descripcion
      usuarioID
      leido
      showAt
      reservaID
      eventoID
      organizadorID
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const onUpdateNotificacion = /* GraphQL */ `
  subscription OnUpdateNotificacion(
    $filter: ModelSubscriptionNotificacionFilterInput
    $usuarioID: String
  ) {
    onUpdateNotificacion(filter: $filter, usuarioID: $usuarioID) {
      id
      tipo
      titulo
      descripcion
      usuarioID
      leido
      showAt
      reservaID
      eventoID
      organizadorID
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const onDeleteNotificacion = /* GraphQL */ `
  subscription OnDeleteNotificacion(
    $filter: ModelSubscriptionNotificacionFilterInput
    $usuarioID: String
  ) {
    onDeleteNotificacion(filter: $filter, usuarioID: $usuarioID) {
      id
      tipo
      titulo
      descripcion
      usuarioID
      leido
      showAt
      reservaID
      eventoID
      organizadorID
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const onCreateBoleto = /* GraphQL */ `
  subscription OnCreateBoleto(
    $filter: ModelSubscriptionBoletoFilterInput
    $owner: String
  ) {
    onCreateBoleto(filter: $filter, owner: $owner) {
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
  subscription OnUpdateBoleto(
    $filter: ModelSubscriptionBoletoFilterInput
    $owner: String
  ) {
    onUpdateBoleto(filter: $filter, owner: $owner) {
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
  subscription OnDeleteBoleto(
    $filter: ModelSubscriptionBoletoFilterInput
    $owner: String
  ) {
    onDeleteBoleto(filter: $filter, owner: $owner) {
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
  subscription OnCreateCupon($filter: ModelSubscriptionCuponFilterInput) {
    onCreateCupon(filter: $filter) {
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
          paymentTime
          tipoPago
          chargeID
          transactionID
          feeID
          cashBarcode
          cashReference
          ingreso
          horaIngreso
          cancelado
          canceledAt
          cancelReason
          fechaExpiracionUTC
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
  subscription OnUpdateCupon($filter: ModelSubscriptionCuponFilterInput) {
    onUpdateCupon(filter: $filter) {
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
          paymentTime
          tipoPago
          chargeID
          transactionID
          feeID
          cashBarcode
          cashReference
          ingreso
          horaIngreso
          cancelado
          canceledAt
          cancelReason
          fechaExpiracionUTC
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
  subscription OnDeleteCupon($filter: ModelSubscriptionCuponFilterInput) {
    onDeleteCupon(filter: $filter) {
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
          paymentTime
          tipoPago
          chargeID
          transactionID
          feeID
          cashBarcode
          cashReference
          ingreso
          horaIngreso
          cancelado
          canceledAt
          cancelReason
          fechaExpiracionUTC
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
  subscription OnCreateReserva($filter: ModelSubscriptionReservaFilterInput) {
    onCreateReserva(filter: $filter) {
      id
      total
      comision
      pagadoAlOrganizador
      cantidad
      pagado
      paymentTime
      tipoPago
      chargeID
      transactionID
      feeID
      cashBarcode
      cashReference
      ingreso
      horaIngreso
      cancelado
      canceledAt
      cancelReason
      fechaExpiracionUTC
      eventoID
      evento {
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
        creator {
          id
          nickname
          nombre
          materno
          paterno
          email
          foto
          cuentaBancaria
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
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        Boletos {
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
      usuarioID
      usuario {
        id
        nickname
        nombre
        materno
        paterno
        email
        foto
        cuentaBancaria
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
      cuponID
      cupon {
        id
        restantes
        vencimiento
        porcentajeDescuento
        cantidadDescuento
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
  subscription OnUpdateReserva($filter: ModelSubscriptionReservaFilterInput) {
    onUpdateReserva(filter: $filter) {
      id
      total
      comision
      pagadoAlOrganizador
      cantidad
      pagado
      paymentTime
      tipoPago
      chargeID
      transactionID
      feeID
      cashBarcode
      cashReference
      ingreso
      horaIngreso
      cancelado
      canceledAt
      cancelReason
      fechaExpiracionUTC
      eventoID
      evento {
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
        creator {
          id
          nickname
          nombre
          materno
          paterno
          email
          foto
          cuentaBancaria
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
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        Boletos {
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
      usuarioID
      usuario {
        id
        nickname
        nombre
        materno
        paterno
        email
        foto
        cuentaBancaria
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
      cuponID
      cupon {
        id
        restantes
        vencimiento
        porcentajeDescuento
        cantidadDescuento
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
  subscription OnDeleteReserva($filter: ModelSubscriptionReservaFilterInput) {
    onDeleteReserva(filter: $filter) {
      id
      total
      comision
      pagadoAlOrganizador
      cantidad
      pagado
      paymentTime
      tipoPago
      chargeID
      transactionID
      feeID
      cashBarcode
      cashReference
      ingreso
      horaIngreso
      cancelado
      canceledAt
      cancelReason
      fechaExpiracionUTC
      eventoID
      evento {
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
        creator {
          id
          nickname
          nombre
          materno
          paterno
          email
          foto
          cuentaBancaria
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
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        Boletos {
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
      usuarioID
      usuario {
        id
        nickname
        nombre
        materno
        paterno
        email
        foto
        cuentaBancaria
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
      cuponID
      cupon {
        id
        restantes
        vencimiento
        porcentajeDescuento
        cantidadDescuento
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
  subscription OnCreateReservasBoletos(
    $filter: ModelSubscriptionReservasBoletosFilterInput
  ) {
    onCreateReservasBoletos(filter: $filter) {
      id
      boletoID
      reservaID
      reserva {
        id
        total
        comision
        pagadoAlOrganizador
        cantidad
        pagado
        paymentTime
        tipoPago
        chargeID
        transactionID
        feeID
        cashBarcode
        cashReference
        ingreso
        horaIngreso
        cancelado
        canceledAt
        cancelReason
        fechaExpiracionUTC
        eventoID
        evento {
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
        usuarioID
        usuario {
          id
          nickname
          nombre
          materno
          paterno
          email
          foto
          cuentaBancaria
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
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        cuponID
        cupon {
          id
          restantes
          vencimiento
          porcentajeDescuento
          cantidadDescuento
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
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
      quantity
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const onUpdateReservasBoletos = /* GraphQL */ `
  subscription OnUpdateReservasBoletos(
    $filter: ModelSubscriptionReservasBoletosFilterInput
  ) {
    onUpdateReservasBoletos(filter: $filter) {
      id
      boletoID
      reservaID
      reserva {
        id
        total
        comision
        pagadoAlOrganizador
        cantidad
        pagado
        paymentTime
        tipoPago
        chargeID
        transactionID
        feeID
        cashBarcode
        cashReference
        ingreso
        horaIngreso
        cancelado
        canceledAt
        cancelReason
        fechaExpiracionUTC
        eventoID
        evento {
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
        usuarioID
        usuario {
          id
          nickname
          nombre
          materno
          paterno
          email
          foto
          cuentaBancaria
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
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        cuponID
        cupon {
          id
          restantes
          vencimiento
          porcentajeDescuento
          cantidadDescuento
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
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
      quantity
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const onDeleteReservasBoletos = /* GraphQL */ `
  subscription OnDeleteReservasBoletos(
    $filter: ModelSubscriptionReservasBoletosFilterInput
  ) {
    onDeleteReservasBoletos(filter: $filter) {
      id
      boletoID
      reservaID
      reserva {
        id
        total
        comision
        pagadoAlOrganizador
        cantidad
        pagado
        paymentTime
        tipoPago
        chargeID
        transactionID
        feeID
        cashBarcode
        cashReference
        ingreso
        horaIngreso
        cancelado
        canceledAt
        cancelReason
        fechaExpiracionUTC
        eventoID
        evento {
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
        usuarioID
        usuario {
          id
          nickname
          nombre
          materno
          paterno
          email
          foto
          cuentaBancaria
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
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
        cuponID
        cupon {
          id
          restantes
          vencimiento
          porcentajeDescuento
          cantidadDescuento
          createdAt
          updatedAt
          _version
          _deleted
          _lastChangedAt
        }
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
      quantity
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
