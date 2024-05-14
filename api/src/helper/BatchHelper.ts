export default class BatchHelper {
    static createBatches<T>(data: T[], batchSize: number): T[][] {
        const batches: T[][] = [];
        for (let i = 0; i < data.length; i += batchSize) {
            batches.push(data.slice(i, i + batchSize));
        }
        return batches;
    }
}