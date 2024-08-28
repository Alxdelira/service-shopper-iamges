const readerPath = {
    "/upload": {
        post: {
            tags: ["Reader"],
            summary: "Envie uma nova imagem com metadados associados",
            description: "Faz o upload de uma imagem com metadados, incluindo o código do cliente e o tipo de medição (ÁGUA ou GÁS). A imagem é processada para extrair valores de medição usando o Google Generative AI.",
            requestBody: {
                content: {
                    "multipart/form-data": {
                        schema: {
                            type: "object",
                            properties: {
                                customer_code: {
                                    type: "string",
                                    description: "Código único identificador do cliente.",
                                    example: "CUST1234"
                                },
                                measure_type: {
                                    type: "string",
                                    enum: ["WATER", "GAS"],
                                    description: "Tipo de medição a ser realizada. Deve ser 'ÁGUA' ou 'GÁS'.",
                                    example: "ÁGUA"
                                },
                                image: {
                                    type: "string",
                                    format: "binary",
                                    description: "Arquivo de imagem a ser processado em formato binário."
                                }
                            },
                            required: ["customer_code", "measure_type", "image"]
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: "Imagem carregada e processada com sucesso.",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    imageUrl: {
                                        type: "string",
                                        description: "URL da imagem carregada.",
                                        example: "http://localhost:3000/uploads/a12b34cd-56ef-78gh-90ij-klmnopqrstu1.png"
                                    },
                                    measureValue: {
                                        type: "number",
                                        description: "Valor extraído da imagem.",
                                        example: 123.45
                                    },
                                    measure_uuid: {
                                        type: "string",
                                        description: "UUID da medição registrada.",
                                        example: "a12b34cd-56ef-78gh-90ij-klmnopqrstu1"
                                    }
                                }
                            }
                        }
                    }
                },
                400: {
                    description: "Requisição inválida. Certifique-se de que todos os campos obrigatórios estão incluídos e corretamente formatados.",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    error_code: {
                                        type: "string",
                                        description: "Código de erro.",
                                        example: "INVALID_DATA"
                                    },
                                    error_description: {
                                        type: "string",
                                        description: "Descrição do erro.",
                                        example: "Os dados fornecidos no corpo da requisição são inválidos."
                                    }
                                }
                            }
                        }
                    }
                },
                409: {
                    description: "Já existe uma medição para este tipo no mês atual.",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    error_code: {
                                        type: "string",
                                        description: "Código de erro.",
                                        example: "DOUBLE_REPORT"
                                    },
                                    error_description: {
                                        type: "string",
                                        description: "Descrição do erro.",
                                        example: "Já existe uma leitura para este tipo no mês atual."
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    "/{customer_code}/list": {
        get: {
            tags: ["Reader"],
            summary: "Recuperar uma lista de imagens para um cliente específico",
            description: "Obtém uma lista de imagens associadas a um código de cliente específico. Opcionalmente, filtre por tipo de medição (ÁGUA ou GÁS).",
            parameters: [
                {
                    name: "customer_code",
                    in: "path",
                    required: true,
                    description: "Código único identificador do cliente.",
                    schema: {
                        type: "string",
                        example: "CUST1234"
                    }
                },
                {
                    name: "measure_type",
                    in: "query",
                    description: "Tipo de medição para filtrar. Opcional. Deve ser 'ÁGUA' ou 'GÁS'.",
                    schema: {
                        type: "string",
                        example: "ÁGUA"
                    }
                }
            ],
            responses: {
                200: {
                    description: "Lista de imagens recuperada com sucesso.",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    customer_code: {
                                        type: "string",
                                        description: "Código do cliente.",
                                        example: "CUST1234"
                                    },
                                    measures: {
                                        type: "array",
                                        items: {
                                            type: "object",
                                            properties: {
                                                measure_uuid: {
                                                    type: "string",
                                                    description: "UUID da medição.",
                                                    example: "a12b34cd-56ef-78gh-90ij-klmnopqrstu1"
                                                },
                                                measure_datetime: {
                                                    type: "string",
                                                    format: "date-time",
                                                    description: "Data e hora em que a medição foi realizada.",
                                                    example: "2024-08-28T14:23:00Z"
                                                },
                                                measure_type: {
                                                    type: "string",
                                                    description: "Tipo de medição.",
                                                    example: "ÁGUA"
                                                },
                                                has_confirmed: {
                                                    type: "boolean",
                                                    description: "Indica se a medição foi confirmada.",
                                                    example: false
                                                },
                                                image_url: {
                                                    type: "string",
                                                    description: "URL da imagem.",
                                                    example: "http://localhost:3000/uploads/a12b34cd-56ef-78gh-90ij-klmnopqrstu1.png"
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                400: {
                    description: "Parâmetros da requisição inválidos.",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    error_code: {
                                        type: "string",
                                        description: "Código de erro.",
                                        example: "INVALID_DATA"
                                    },
                                    error_description: {
                                        type: "string",
                                        description: "Descrição do erro.",
                                        example: "Os dados fornecidos no corpo da requisição são inválidos."
                                    }
                                }
                            }
                        }
                    }
                },
                404: {
                    description: "Nenhuma medição encontrada para o código de cliente especificado.",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    error_code: {
                                        type: "string",
                                        description: "Código de erro.",
                                        example: "MEASURES_NOT_FOUND"
                                    },
                                    error_description: {
                                        type: "string",
                                        description: "Descrição do erro.",
                                        example: "Nenhuma leitura encontrada."
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    "/confirm": {
        patch: {
            tags: ["Reader"],
            summary: "Confirmar uma medição",
            description: "Atualiza o status de confirmação de uma medição, definindo o valor confirmado com base no UUID fornecido.",
            requestBody: {
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                measure_uuid: {
                                    type: "string",
                                    description: "UUID da medição a ser confirmada.",
                                    example: "a12b34cd-56ef-78gh-90ij-klmnopqrstu1"
                                },
                                confirmed_value: {
                                    type: "number",
                                    description: "Valor confirmado da medição.",
                                    example: 123.45
                                }
                            },
                            required: ["measure_uuid", "confirmed_value"]
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: "Medição confirmada com sucesso.",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: {
                                        type: "boolean",
                                        description: "Indica se a operação foi bem-sucedida.",
                                        example: true
                                    }
                                }
                            }
                        }
                    }
                },
                400: {
                    description: "Requisição inválida. Certifique-se de que o UUID e o valor confirmado são fornecidos e estão corretamente formatados.",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    error_code: {
                                        type: "string",
                                        description: "Código de erro.",
                                        example: "INVALID_DATA"
                                    },
                                    error_description: {
                                        type: "string",
                                        description: "Descrição do erro.",
                                        example: "Os dados fornecidos no corpo da requisição são inválidos."
                                    }
                                }
                            }
                        }
                    },
                },
                404: {
                    description: "Medição não encontrada para o UUID fornecido.",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    error_code: {
                                        type: "string",
                                        description: "Código de erro.",
                                        example: "MEASURE_NOT_FOUND"
                                    },
                                    error_description: {
                                        type: "string",
                                        description: "Descrição do erro.",
                                        example: "Leitura não encontrada."
                                    }
                                }
                            }
                        }
                    }
                },
                409: {
                    description: "Medição do mês já foi confirmada.",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    error_code: {
                                        type: "string",
                                        description: "Código de erro.",
                                        example: "CONFIRMATION_DUPLICATE"
                                    },
                                    error_description: {
                                        type: "string",
                                        description: "Descrição do erro.",
                                        example: "Leitura do mês já realizada."
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};

export { readerPath };
