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
      cuentaBancaria
      receiveNewReservations
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
        cuentaBancaria
        receiveNewReservations
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
        cuentaBancaria
        receiveNewReservations
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
        receiveNewReservations
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
          receiveNewReservations
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
          receiveNewReservations
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
      nextToken
      startedAt
    }
  }
`;
export const getNotificacion = /* GraphQL */ `
  query GetNotificacion($id: ID!) {
    getNotificacion(id: $id) {
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
export const listNotificacions = /* GraphQL */ `
  query ListNotificacions(
    $filter: ModelNotificacionFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listNotificacions(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
      startedAt
    }
  }
`;
export const syncNotificacions = /* GraphQL */ `
  query SyncNotificacions(
    $filter: ModelNotificacionFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncNotificacions(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
      items {
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
      nextToken
      startedAt
    }
  }
`;
export const getBoleto = /* GraphQL */ `
  query GetBoleto($id: ID!) {
    getBoleto(id: $id) {
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
export const listBoletos = /* GraphQL */ `
  query ListBoletos(
    $filter: ModelBoletoFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listBoletos(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
      startedAt
    }
  }
`;
export const syncBoletos = /* GraphQL */ `
  query SyncBoletos(
    $filter: ModelBoletoFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncBoletos(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
      items {
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
      nextToken
      startedAt
    }
  }
`;
export const getCupon = /* GraphQL */ `
  query GetCupon($id: ID!) {
    getCupon(id: $id) {
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
export const listCupons = /* GraphQL */ `
  query ListCupons(
    $filter: ModelCuponFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listCupons(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
      startedAt
    }
  }
`;
export const syncCupons = /* GraphQL */ `
  query SyncCupons(
    $filter: ModelCuponFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncCupons(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
      items {
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
          receiveNewReservations
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
        receiveNewReservations
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
          receiveNewReservations
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
          receiveNewReservations
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
      nextToken
      startedAt
    }
  }
`;
export const getReservasBoletos = /* GraphQL */ `
  query GetReservasBoletos($id: ID!) {
    getReservasBoletos(id: $id) {
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
          receiveNewReservations
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
export const listReservasBoletos = /* GraphQL */ `
  query ListReservasBoletos(
    $filter: ModelReservasBoletosFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listReservasBoletos(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
          usuarioID
          cuponID
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
      nextToken
      startedAt
    }
  }
`;
export const syncReservasBoletos = /* GraphQL */ `
  query SyncReservasBoletos(
    $filter: ModelReservasBoletosFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncReservasBoletos(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
      items {
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
          usuarioID
          cuponID
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
      nextToken
      startedAt
    }
  }
`;
