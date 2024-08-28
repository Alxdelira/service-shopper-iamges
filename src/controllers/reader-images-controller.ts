import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { v4 as uuidv4 } from 'uuid';
import ImageModel from '../models/image-models';
import * as dotenv from 'dotenv';
import { extractNumber } from '../utils/image-utils';

dotenv.config();
const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

export default class ReaderImagesController {
   static async uploadImage(req: Request, res: Response) {
      const { measure_type, customer_code } = req.body;
      if (!measure_type || !customer_code) {
         return res.status(400).json({ error_code: 'INVALID_DATA', error_description: 'Os dados fornecidos no corpo da requisição são inválidos' });
      }

      if (!['WATER', 'GAS'].includes(measure_type as string)) {
         return res.status(400).json({ error_code: 'INVALID_DATA', error_description: 'Os dados fornecidos no corpo da requisição são inválidos' });
      }

      if (!req.file) {
         return res.status(400).json({ error: 'Nenhum arquivo foi enviado.' });
      }

      try {
         // Obter o mês e o ano da data atual
         const currentDate = new Date();
         const currentMonth = currentDate.getMonth() + 1; // Mês começa em 0
         const currentYear = currentDate.getFullYear();

         // Verificar se já existe uma leitura para o cliente, tipo de leitura e mês/ano atuais
         const existingReading = await ImageModel.findOne({
            customer_code,
            measure_type,
            measure_datetime: {
               $gte: new Date(currentYear, currentMonth - 1, 1),
               $lt: new Date(currentYear, currentMonth, 1),
            },
         });

         if (existingReading) {
            return res.status(409).json({ error_code: 'DOUBLE_REPORT', error_description: 'Já existe uma leitura para este tipo no mês atual' });
         }

         // Converte a imagem para base64
         const imageBase64 = req.file.buffer.toString('base64');
         const imagePart = {
            inlineData: {
               data: imageBase64,
               mimeType: req.file.mimetype,
            },
         };

         // Configura o modelo e envia a imagem para processamento conforme a documentação do Google Generative AI
         const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
         const result = await model.generateContent([imagePart]);
         const response = await result.response;
         const text = await response.text();

         const measureValue = extractNumber(text);

         if (measureValue === null) {
            return res.status(400).json({ error: 'Número não encontrado na imagem.' });
         }

         const measure_uuid = uuidv4();
         const imageUrl = `http://localhost:3000/uploads/${measure_uuid}.png`;


         const newImage = await ImageModel.create({
            image: imageBase64,
            measure_uuid,
            customer_code,
            measure_datetime: new Date(),
            measure_type,
            image_url: imageUrl,
            measure_value: measureValue
         });


         return res.status(200).json({ imageUrl, measureValue, measure_uuid });
      } catch (error) {
         console.error(error);
         return res.status(500).json({ error: 'Erro ao processar a imagem.' });
      }
   }

   static async getImage(req: Request, res: Response) {
      const { customer_code } = req.params;
      const { measure_type } = req.query;
      const filter = {
         measure_type: { $regex: measure_type || "", $options: 'i' },
      };
      if (!customer_code) {
         return res.status(400).json({ error: '' });
      }
      if (measure_type && !['WATER', 'GAS'].includes(measure_type as string)) {
         return res.status(400).json({ error_code: 'INVALID_TYPE', error_description: 'Os dados fornecidos no corpo da requisição são inválidos' });
      }

      const measure = await ImageModel.find({ customer_code, ...filter });
      const formattedMeasures = measure.map(measure => ({
         measure_uuid: measure.measure_uuid,
         measure_datetime: measure.measure_datetime,
         measure_type: measure.measure_type,
         has_confirmed: measure.has_confirmed,
         image_url: measure.image_url
      }));

      if (formattedMeasures.length === 0) {
         return res.status(404).json({ error_code: 'MEASURES_NOT_FOUND', error_description: 'Nenhuma leitura encontrada' });
      }

      return res.status(200).json({ customer_code, measures: formattedMeasures });

   }

   static async confirmImage(req: Request, res: Response) {
      const { measure_uuid, confirmed_value } = req.body;

      if (!measure_uuid || typeof measure_uuid !== 'string' || typeof confirmed_value !== 'number') {
         return res.status(400).json({ error_code: 'INVALID_DATA', error_description: 'Os dados fornecidos no corpo da requisição são inválidos' });
      }

     
      const measure = await ImageModel.findOne({ measure_uuid });
      if (!measure) {
         return res.status(404).json({ error_code: 'MEASURE_NOT_FOUND', error_description: 'Leitura não encontrada' });
      }

     
      if (measure.has_confirmed) {
         return res.status(409).json({ error_code: 'CONFIRMATION_DUPLICATE', error_description: 'Leitura do mês já realizada' });
      }

      measure.has_confirmed = true;
      measure.measure_value = confirmed_value;
      await measure.save();

      return res.status(200).json({ success: true });
   }
}
