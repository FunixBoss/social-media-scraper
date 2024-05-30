export default class BatchHelper {
    static createBatches<T>(data: T[], options: { batchSize?: number, totalBatch?: number } = { batchSize: 5 }): T[][] {
        const { batchSize, totalBatch } = options;

        if (totalBatch) {
            const batches: T[][] = [];
            const batchSizeCalculated = Math.ceil(data.length / totalBatch);
            
            for (let i = 0; i < totalBatch; i++) {
                const start = i * batchSizeCalculated;
                const end = start + batchSizeCalculated;
                batches.push(data.slice(start, end));
            }
            return batches;
        } else {
            const batches: T[][] = [];
            for (let i = 0; i < data.length; i += batchSize) {
                batches.push(data.slice(i, i + batchSize));
            }
            return batches;
        }
    }
}
