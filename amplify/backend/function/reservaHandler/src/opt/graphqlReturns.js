exports.updateBoletoReturns = `
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
`

exports.createReservasBoletosReturns = `
id
boletoID
reservaID
quantity
updatedAt
createdAt
_version
_deleted
_lastChangedAt
`



exports.updateEventoReturns = `
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
comisionPercent
comisionRP
allowPaymentsInPlace
personasReservadas
personasMax
precioMin
precioMax
paymentProductID
CreatorID
createdAt
updatedAt
_version
_deleted
_lastChangedAt
`

exports.updateCuponReturns = `
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
`


exports.createNotificacionReturns = `
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
`

exports.reservaReturns = `
id
total
comision
pagadoAlOrganizador
pagadoARP
cantidad
pagado
paymentTime
referedFrom
transaccionAOrganizadorID
tipoPago
chargeID
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
`