import { BatchEntryResource } from './resources/batchEntryResource.js';

export class BatchEntryController {
    constructor(batchEntryService) {
        this.batchEntryService = batchEntryService;
    }

    async getAllBatchEntries(req, res, next) {
        try {
            const { tenant_id } = req.user;

            const filters = {};

            const batchEntries = await this.batchEntryService.getAllBatchEntries(tenant_id, filters);
            const data = BatchEntryResource.collection(batchEntries);

            res.json({
                success: true,
                data: data,
                total: batchEntries.length
            });
        } catch (error) {
            next(error);
        }
    }

    async getDetail(req, res, next) {
        try {
            const { tenant_id } = req.user;
            const { id } = req.params;

            const batchEntry = await this.batchEntryService.getBatchEntryDetail(tenant_id, id);
            const data = BatchEntryResource.transformDetail(batchEntry);

            res.json({
                success: true,
                data
            });
        } catch (error) {
            next(error);
        }
    };

    async create(req, res, next) {
        try {
            const { tenant_id, id: userId } = req.user;
            const data = req.body;

            data.tenantId = tenant_id;

            const createdBatchEntry = await this.batchEntryService.create(data, userId);
            const responseData = BatchEntryResource.transformDetail(createdBatchEntry);

            res.json({
                success: true,
                data: responseData,
                message: req.t('templates.created', {
                    entity: req.t('entities.batchEntry.singular') 
                })
            });
        } catch (error) {
            next(error);
        }
    }
}