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
      creator {
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
      creator {
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
      creator {
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
export const createNotificacion = /* GraphQL */ `
  mutation CreateNotificacion(
    $input: CreateNotificacionInput!
    $condition: ModelNotificacionConditionInput
  ) {
    createNotificacion(input: $input, condition: $condition) {
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
export const updateNotificacion = /* GraphQL */ `
  mutation UpdateNotificacion(
    $input: UpdateNotificacionInput!
    $condition: ModelNotificacionConditionInput
  ) {
    updateNotificacion(input: $input, condition: $condition) {
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
export const deleteNotificacion = /* GraphQL */ `
  mutation DeleteNotificacion(
    $input: DeleteNotificacionInput!
    $condition: ModelNotificacionConditionInput
  ) {
    deleteNotificacion(input: $input, condition: $condition) {
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
export const createReserva = /* GraphQL */ `
  mutation CreateReserva(
    $input: CreateReservaInput!
    $condition: ModelReservaConditionInput
  ) {
    createReserva(input: $input, condition: $condition) {
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
export const updateReserva = /* GraphQL */ `
  mutation UpdateReserva(
    $input: UpdateReservaInput!
    $condition: ModelReservaConditionInput
  ) {
    updateReserva(input: $input, condition: $condition) {
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
export const deleteReserva = /* GraphQL */ `
  mutation DeleteReserva(
    $input: DeleteReservaInput!
    $condition: ModelReservaConditionInput
  ) {
    deleteReserva(input: $input, condition: $condition) {
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
export const createReservasBoletos = /* GraphQL */ `
  mutation CreateReservasBoletos(
    $input: CreateReservasBoletosInput!
    $condition: ModelReservasBoletosConditionInput
  ) {
    createReservasBoletos(input: $input, condition: $condition) {
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
export const updateReservasBoletos = /* GraphQL */ `
  mutation UpdateReservasBoletos(
    $input: UpdateReservasBoletosInput!
    $condition: ModelReservasBoletosConditionInput
  ) {
    updateReservasBoletos(input: $input, condition: $condition) {
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
export const deleteReservasBoletos = /* GraphQL */ `
  mutation DeleteReservasBoletos(
    $input: DeleteReservasBoletosInput!
    $condition: ModelReservasBoletosConditionInput
  ) {
    deleteReservasBoletos(input: $input, condition: $condition) {
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
