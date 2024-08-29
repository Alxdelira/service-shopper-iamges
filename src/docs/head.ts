import { readerPath } from "./reader-image-path";


const swaggerOptions = {
    swaggerDefinition: {
        openapi: "3.0.0",
        info: {
            title: "API-Shopper - Integração com GemeniAI",
            description:
                "Esta API foi projetada para fornecer uma solução robusta e integrada para a leitura automatizada de hidrômetros de água e gás.\n\n" +
                "Esta API permite a captura, processamento e análise de imagens de medidores de consumo, utilizando a avançada tecnologia da GEMINI AI para garantir a precisão e eficiência dos dados coletados.\n\n" +
                "Ao adotar esta API, desenvolvedores podem facilmente implementar funcionalidades que permitem a leitura automática de valores em hidrômetros, com suporte para diferentes tipos de medidores, incluindo água e gás.\n\n" +
                "A API lida com todo o fluxo de trabalho, desde o upload de imagens até a extração dos dados relevantes, facilitando a integração perfeita com sistemas de gestão de consumo.\n\n" +
                "Em resumo, esta API não só oferece uma solução técnica avançada para a leitura de hidrômetros, como também proporciona uma base sólida para o desenvolvimento de sistemas de monitoramento de consumo de água e gás, otimizando o processo de coleta e análise de dados de consumo.",
            version: "0.1.0",
            contact: {
                name: "Alexandre Nogueira",
                email: "alx.delira@gmail.com",
                url: "https://portfolioalxdelira.vercel.app/",
            },
            license: {
                name: "MIT",
                url: "https://github.com/Alxdelira/service-shopper-iamges/blob/main/LICENSE",
            },
        },
        externalDocs: {
            description: "Documentação detalhada",
            url: "https://github.com/Alxdelira/service-shopper-iamges",
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT}`,
                description: "API em desenvolvimento",
            },
        ],
        components: {
            schemas: {
                // TODO: Adicionar schemas de modelos -- não implementei pq era só uma sugestão
            },
        },
        tags: [
            { name: "Reader", description: "Upload da imagem e dados" },
        ],
        paths: {
            ...readerPath
        },
    },
    apis: ["./src/routes/*.ts"],
};

export default swaggerOptions;