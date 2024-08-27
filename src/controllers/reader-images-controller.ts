import { Request, Response } from 'express';
import { badRequest, notFound, ok, serverError } from '../utils/http-helper';
import ImageModel from '../models/image-models';

export default class ReaderImagesController {
   static async getImages(req: Request, res: Response) {
      try {
         const customer_code = req.params.customer_code;
         const measure_type = req.query.measure_type?.toString().toUpperCase(); 

         // Validação do tipo de medição
         if (measure_type && !['WATER', 'GAS'].includes(measure_type)) {
            return res.status(400).json(await badRequest(new Error('Tipo de medição não permitida')));
         }

         // Construção do filtro
         const filter: any = { customer_code };
         if (measure_type) {
            filter.measure_type = measure_type;
         }

         // Consulta ao banco de dados
         const measures = await ImageModel.find(filter);

         // Verificação se algum registro foi encontrado
         if (measures.length === 0) {
            return res.status(404).json(await notFound());
         }

         // Resposta com os dados
         return res.status(200).json(await ok({
            customer_code,
            measures: measures.map(measure => ({
               measure_uuid: measure.measure_uuid,
               measure_datetime: measure.measure_datetime,
               measure_type: measure.measure_type,
               has_confirmed: measure.has_confirmed,
               image_url: measure.image_url
            }))
         }));
      } catch (error) {
         return res.status(500).json(await serverError(error as Error));
      }
   }
}
