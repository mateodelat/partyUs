export const schema = {
    "models": {
        "Usuario": {
            "name": "Usuario",
            "fields": {
                "id": {
                    "name": "id",
                    "isArray": false,
                    "type": "ID",
                    "isRequired": true,
                    "attributes": []
                },
                "nickname": {
                    "name": "nickname",
                    "isArray": false,
                    "type": "String",
                    "isRequired": true,
                    "attributes": []
                },
                "nombre": {
                    "name": "nombre",
                    "isArray": false,
                    "type": "String",
                    "isRequired": false,
                    "attributes": []
                },
                "materno": {
                    "name": "materno",
                    "isArray": false,
                    "type": "String",
                    "isRequired": false,
                    "attributes": []
                },
                "paterno": {
                    "name": "paterno",
                    "isArray": false,
                    "type": "String",
                    "isRequired": false,
                    "attributes": []
                },
                "email": {
                    "name": "email",
                    "isArray": false,
                    "type": "String",
                    "isRequired": true,
                    "attributes": []
                },
                "phoneNumber": {
                    "name": "phoneNumber",
                    "isArray": false,
                    "type": "String",
                    "isRequired": false,
                    "attributes": []
                },
                "phoneCode": {
                    "name": "phoneCode",
                    "isArray": false,
                    "type": "String",
                    "isRequired": false,
                    "attributes": []
                },
                "organizador": {
                    "name": "organizador",
                    "isArray": false,
                    "type": "Boolean",
                    "isRequired": false,
                    "attributes": []
                },
                "admin": {
                    "name": "admin",
                    "isArray": false,
                    "type": "Boolean",
                    "isRequired": false,
                    "attributes": []
                },
                "idUploaded": {
                    "name": "idUploaded",
                    "isArray": false,
                    "type": "Boolean",
                    "isRequired": false,
                    "attributes": []
                },
                "idData": {
                    "name": "idData",
                    "isArray": false,
                    "type": "AWSJSON",
                    "isRequired": false,
                    "attributes": []
                },
                "fechaNacimiento": {
                    "name": "fechaNacimiento",
                    "isArray": false,
                    "type": "String",
                    "isRequired": false,
                    "attributes": []
                },
                "calificacion": {
                    "name": "calificacion",
                    "isArray": false,
                    "type": "Float",
                    "isRequired": false,
                    "attributes": []
                },
                "numResenas": {
                    "name": "numResenas",
                    "isArray": false,
                    "type": "Int",
                    "isRequired": false,
                    "attributes": []
                },
                "notificationToken": {
                    "name": "notificationToken",
                    "isArray": false,
                    "type": "String",
                    "isRequired": false,
                    "attributes": []
                },
                "Eventos": {
                    "name": "Eventos",
                    "isArray": true,
                    "type": {
                        "model": "Evento"
                    },
                    "isRequired": false,
                    "attributes": [],
                    "isArrayNullable": true,
                    "association": {
                        "connectionType": "HAS_MANY",
                        "associatedWith": "CreatorID"
                    }
                },
                "Reservas": {
                    "name": "Reservas",
                    "isArray": true,
                    "type": {
                        "model": "Reserva"
                    },
                    "isRequired": false,
                    "attributes": [],
                    "isArrayNullable": true,
                    "association": {
                        "connectionType": "HAS_MANY",
                        "associatedWith": "usuarioID"
                    }
                },
                "createdAt": {
                    "name": "createdAt",
                    "isArray": false,
                    "type": "AWSDateTime",
                    "isRequired": false,
                    "attributes": [],
                    "isReadOnly": true
                },
                "updatedAt": {
                    "name": "updatedAt",
                    "isArray": false,
                    "type": "AWSDateTime",
                    "isRequired": false,
                    "attributes": [],
                    "isReadOnly": true
                }
            },
            "syncable": true,
            "pluralName": "Usuarios",
            "attributes": [
                {
                    "type": "model",
                    "properties": {}
                }
            ]
        },
        "Evento": {
            "name": "Evento",
            "fields": {
                "id": {
                    "name": "id",
                    "isArray": false,
                    "type": "ID",
                    "isRequired": true,
                    "attributes": []
                },
                "imagenes": {
                    "name": "imagenes",
                    "isArray": true,
                    "type": "AWSJSON",
                    "isRequired": true,
                    "attributes": [],
                    "isArrayNullable": false
                },
                "titulo": {
                    "name": "titulo",
                    "isArray": false,
                    "type": "String",
                    "isRequired": true,
                    "attributes": []
                },
                "detalles": {
                    "name": "detalles",
                    "isArray": false,
                    "type": "String",
                    "isRequired": false,
                    "attributes": []
                },
                "ubicacion": {
                    "name": "ubicacion",
                    "isArray": false,
                    "type": "AWSJSON",
                    "isRequired": true,
                    "attributes": []
                },
                "fechaInicial": {
                    "name": "fechaInicial",
                    "isArray": false,
                    "type": "String",
                    "isRequired": true,
                    "attributes": []
                },
                "fechaFinal": {
                    "name": "fechaFinal",
                    "isArray": false,
                    "type": "String",
                    "isRequired": true,
                    "attributes": []
                },
                "boletos": {
                    "name": "boletos",
                    "isArray": true,
                    "type": "AWSJSON",
                    "isRequired": true,
                    "attributes": [],
                    "isArrayNullable": false
                },
                "tosAceptance": {
                    "name": "tosAceptance",
                    "isArray": false,
                    "type": "AWSJSON",
                    "isRequired": true,
                    "attributes": []
                },
                "tipoLugar": {
                    "name": "tipoLugar",
                    "isArray": false,
                    "type": {
                        "enum": "PlaceEnum"
                    },
                    "isRequired": true,
                    "attributes": []
                },
                "musica": {
                    "name": "musica",
                    "isArray": false,
                    "type": {
                        "enum": "MusicEnum"
                    },
                    "isRequired": true,
                    "attributes": []
                },
                "comodities": {
                    "name": "comodities",
                    "isArray": true,
                    "type": {
                        "enum": "ComoditiesEnum"
                    },
                    "isRequired": false,
                    "attributes": [],
                    "isArrayNullable": true
                },
                "musOtra": {
                    "name": "musOtra",
                    "isArray": false,
                    "type": "String",
                    "isRequired": false,
                    "attributes": []
                },
                "CreatorID": {
                    "name": "CreatorID",
                    "isArray": false,
                    "type": "ID",
                    "isRequired": true,
                    "attributes": []
                },
                "Creator": {
                    "name": "Creator",
                    "isArray": false,
                    "type": {
                        "model": "Usuario"
                    },
                    "isRequired": false,
                    "attributes": [],
                    "association": {
                        "connectionType": "BELONGS_TO",
                        "targetName": "usuarioEventosId"
                    }
                },
                "Reservas": {
                    "name": "Reservas",
                    "isArray": true,
                    "type": {
                        "model": "Reserva"
                    },
                    "isRequired": true,
                    "attributes": [],
                    "isArrayNullable": true,
                    "association": {
                        "connectionType": "HAS_MANY",
                        "associatedWith": "eventoID"
                    }
                },
                "createdAt": {
                    "name": "createdAt",
                    "isArray": false,
                    "type": "AWSDateTime",
                    "isRequired": false,
                    "attributes": [],
                    "isReadOnly": true
                },
                "updatedAt": {
                    "name": "updatedAt",
                    "isArray": false,
                    "type": "AWSDateTime",
                    "isRequired": false,
                    "attributes": [],
                    "isReadOnly": true
                }
            },
            "syncable": true,
            "pluralName": "Eventos",
            "attributes": [
                {
                    "type": "model",
                    "properties": {}
                },
                {
                    "type": "key",
                    "properties": {
                        "name": "byUsuario",
                        "fields": [
                            "CreatorID"
                        ]
                    }
                }
            ]
        },
        "Reserva": {
            "name": "Reserva",
            "fields": {
                "id": {
                    "name": "id",
                    "isArray": false,
                    "type": "ID",
                    "isRequired": true,
                    "attributes": []
                },
                "total": {
                    "name": "total",
                    "isArray": false,
                    "type": "Float",
                    "isRequired": true,
                    "attributes": []
                },
                "precioIndividual": {
                    "name": "precioIndividual",
                    "isArray": false,
                    "type": "Float",
                    "isRequired": true,
                    "attributes": []
                },
                "comision": {
                    "name": "comision",
                    "isArray": false,
                    "type": "Float",
                    "isRequired": true,
                    "attributes": []
                },
                "pagadoAlOrganizador": {
                    "name": "pagadoAlOrganizador",
                    "isArray": false,
                    "type": "Float",
                    "isRequired": true,
                    "attributes": []
                },
                "tituloBoleto": {
                    "name": "tituloBoleto",
                    "isArray": false,
                    "type": "String",
                    "isRequired": true,
                    "attributes": []
                },
                "descripcionBoleto": {
                    "name": "descripcionBoleto",
                    "isArray": false,
                    "type": "String",
                    "isRequired": false,
                    "attributes": []
                },
                "cantidad": {
                    "name": "cantidad",
                    "isArray": false,
                    "type": "Int",
                    "isRequired": true,
                    "attributes": []
                },
                "pagoID": {
                    "name": "pagoID",
                    "isArray": false,
                    "type": "String",
                    "isRequired": false,
                    "attributes": []
                },
                "ingreso": {
                    "name": "ingreso",
                    "isArray": false,
                    "type": "Boolean",
                    "isRequired": false,
                    "attributes": []
                },
                "horaIngreso": {
                    "name": "horaIngreso",
                    "isArray": false,
                    "type": "AWSDateTime",
                    "isRequired": false,
                    "attributes": []
                },
                "cancelado": {
                    "name": "cancelado",
                    "isArray": false,
                    "type": "Boolean",
                    "isRequired": false,
                    "attributes": []
                },
                "canceledAt": {
                    "name": "canceledAt",
                    "isArray": false,
                    "type": "AWSDateTime",
                    "isRequired": false,
                    "attributes": []
                },
                "cancelReason": {
                    "name": "cancelReason",
                    "isArray": false,
                    "type": {
                        "enum": "ReservaCancelReason"
                    },
                    "isRequired": false,
                    "attributes": []
                },
                "eventoID": {
                    "name": "eventoID",
                    "isArray": false,
                    "type": "ID",
                    "isRequired": true,
                    "attributes": []
                },
                "usuarioID": {
                    "name": "usuarioID",
                    "isArray": false,
                    "type": "ID",
                    "isRequired": true,
                    "attributes": []
                },
                "organizadorID": {
                    "name": "organizadorID",
                    "isArray": false,
                    "type": "ID",
                    "isRequired": false,
                    "attributes": []
                },
                "createdAt": {
                    "name": "createdAt",
                    "isArray": false,
                    "type": "AWSDateTime",
                    "isRequired": false,
                    "attributes": [],
                    "isReadOnly": true
                },
                "updatedAt": {
                    "name": "updatedAt",
                    "isArray": false,
                    "type": "AWSDateTime",
                    "isRequired": false,
                    "attributes": [],
                    "isReadOnly": true
                }
            },
            "syncable": true,
            "pluralName": "Reservas",
            "attributes": [
                {
                    "type": "model",
                    "properties": {}
                },
                {
                    "type": "key",
                    "properties": {
                        "name": "byEvento",
                        "fields": [
                            "eventoID"
                        ]
                    }
                },
                {
                    "type": "key",
                    "properties": {
                        "name": "byUsuario",
                        "fields": [
                            "usuarioID"
                        ]
                    }
                }
            ]
        }
    },
    "enums": {
        "PlaceEnum": {
            "name": "PlaceEnum",
            "values": [
                "EXTERIOR",
                "INTERIOR"
            ]
        },
        "MusicEnum": {
            "name": "MusicEnum",
            "values": [
                "REGGETON",
                "POP",
                "TECNO",
                "RAP",
                "BANDA",
                "ROCK",
                "OTRO"
            ]
        },
        "ComoditiesEnum": {
            "name": "ComoditiesEnum",
            "values": [
                "DJ",
                "ALBERCA",
                "BARRALIBRE",
                "COMIDA",
                "SEGURIDAD"
            ]
        },
        "ReservaCancelReason": {
            "name": "ReservaCancelReason",
            "values": [
                "EVENTOCERRADO",
                "CANCELADOPORCLIENTE"
            ]
        }
    },
    "nonModels": {},
    "version": "cb8fee77045ef9bfdd771c6bb230e142"
};