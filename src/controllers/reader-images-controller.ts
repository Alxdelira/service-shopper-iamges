import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { v4 as uuidv4 } from 'uuid';
import ImageModel from '../models/image-models';
import * as dotenv from 'dotenv';
import { extractNumber } from '../utils/image-utils';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

enum MeasureType {
   WATER = 'WATER',
   GAS = 'GAS'
}

export default class ReaderImagesController {
   static async uploadImage(req: Request, res: Response): Promise<Response> {
      const { measure_type, customer_code } = req.body;
      const file = req.file;

      if (!measure_type || !customer_code) {
         return res.status(400).json({ error_code: 'INVALID_DATA', error_description: 'Os dados fornecidos no corpo da requisição são inválidos' });
      }

      if (!Object.values(MeasureType).includes(measure_type as MeasureType)) {
         return res.status(400).json({ error_code: 'INVALID_DATA', error_description: 'Os dados fornecidos no corpo da requisição são inválidos' });
      }

      if (!file) {
         return res.status(400).json({error_code: 'INVALID_DATA', error_description: 'Os dados fornecidos no corpo da requisição são inválidos' });
      }

      try {
         const currentDate = new Date();
         const currentMonth = currentDate.getMonth();
         const currentYear = currentDate.getFullYear();

         const existingReading = await ImageModel.findOne({
            customer_code,
            measure_type,
            measure_datetime: {
               $gte: new Date(currentYear, currentMonth, 1),
               $lt: new Date(currentYear, currentMonth + 1, 1),
            },
         });

         if (existingReading) {
            return res.status(409).json({ error_code: 'DOUBLE_REPORT', error_description: 'Já existe uma leitura para este tipo no mês atual' });
         }

         const imageBase64 = file.buffer.toString('base64');
         const imagePart = {
            inlineData: {
               data: imageBase64,
               mimeType: file.mimetype,
            },
         };

         const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
         const result = await model.generateContent([imagePart]);
         const response = await result.response.text();

         const measureValue = extractNumber(response);

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
         return res.status(500).json({error_code: 'SERVER_ERROR', error_description: 'Error interno no servidor. Entre em contato com o administrador do Sistema' });
      }
   }

   static async getImage(req: Request, res: Response): Promise<Response> {
      const { customer_code } = req.params;
      const { measure_type } = req.query;

      if (!customer_code) {
         return res.status(400).json({ error: 'Código do cliente não fornecido.' });
      }

      if (measure_type && !Object.values(MeasureType).includes(measure_type as MeasureType)) {
         return res.status(400).json({ error_code: 'INVALID_TYPE', error_description: 'Tipo de medição inválido' });
      }

      try {
         const measure = await ImageModel.find({
            customer_code,
            ...(measure_type ? { measure_type: { $regex: measure_type as string, $options: 'i' } } : {})
         });

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
      } catch (error) {
         console.error(error);
         return res.status(500).json({ error_code: 'SERVER_ERROR', error_description: 'Error interno no servidor. Entre em contato com o administrador do Sistema' });
      }
   }

   static async confirmImage(req: Request, res: Response): Promise<Response> {
      const { measure_uuid, confirmed_value } = req.body;

      if (!measure_uuid || typeof measure_uuid !== 'string' || typeof confirmed_value !== 'number') {
         return res.status(400).json({ error_code: 'INVALID_DATA', error_description: 'Os dados fornecidos no corpo da requisição são inválidos' });
      }

      try {
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
      } catch (error) {
         console.error(error);
         return res.status(500).json({ error_code: 'SERVER_ERROR', error_description: 'Error interno no servidor. Entre em contato com o administrador do Sistema'});
      }
   }
}
