import { Processor, Process, OnQueueActive, OnQueueCompleted, OnQueueFailed, OnQueueStalled, OnQueueProgress, OnQueueError, OnQueueWaiting, OnQueueRemoved } from '@nestjs/bull';
import { InjectQueue } from '@nestjs/bull';
import { Queue, Job } from 'bull';
import { DownloadType } from '../dto/download-type.dto';
import { ChannelDownloadService } from '../service/channel-download.service';

@Processor({
    name: 'ins-download-queue',
})
export class DownloadProcessor {
    constructor(
        private readonly channelDownloadService: ChannelDownloadService,
        @InjectQueue('ins-download-queue') private readonly downloadQueue: Queue
    ) { }

    @OnQueueActive()
    onActive(job: Job) {
        console.log(
            `Processing job ${job.id} of type ${job.name} with data ${job.data}...`,
        );
    }

    @OnQueueCompleted()
    onCompleted(job: Job, result: any) {
        console.log(
            `Completed job ${job.id} of type ${job.name} with result ${result}...`,
        );
    }

    @OnQueueFailed()
    onFailed(job: Job, error: any) {
        console.log(
            `Failed job ${job.id} of type ${job.name} with error ${error}...`,
        );
    }

    @OnQueueStalled()
    onStalled(job: Job) {
        console.log(
            `Stalled job ${job.id} of type ${job.name}...`,
        );
    }

    @OnQueueProgress()
    onProgress(job: Job, progress: number) {
        console.log(
            `Job ${job.id} of type ${job.name} is ${progress}% complete...`,
        );
    }

    @OnQueueError()
    onError(error: any) {
        console.log(
            `Error occurred in queue: ${error.message}...`,
        );
    }

    @OnQueueWaiting()
    onWaiting(jobId: string) {
        console.log(
            `Job ${jobId} is waiting...`,
        );
    }

    @OnQueueRemoved()
    onRemoved(job: Job) {
        console.log(
            `Removed job ${job.id} of type ${job.name}...`,
        );
    }

    @Process('download')
    async handleDownload(job: Job<{ username: string; download: DownloadType }>): Promise<void> {
        try {
            this.listAllJobs()
            const { username, download } = job.data;
            this.channelDownloadService.logger.log(`Processing download for user: ${username}`);
            await this.channelDownloadService.download(username, download);
        } catch (error) {
            this.channelDownloadService.logger.error('Error processing download job:', error);
        }
    }

    // Method to list all jobs in the queue
    async listAllJobs(): Promise<void> {
        const waitingJobs = await this.downloadQueue.getWaiting();
        const activeJobs = await this.downloadQueue.getActive();
        const completedJobs = await this.downloadQueue.getCompleted();
        const failedJobs = await this.downloadQueue.getFailed();
        const delayedJobs = await this.downloadQueue.getDelayed();

        console.log('Waiting Jobs:', waitingJobs);
        console.log('Active Jobs:', activeJobs.map(job => job.data));
        console.log('Completed Jobs:', completedJobs);
        console.log('Failed Jobs:', failedJobs);
        console.log('Delayed Jobs:', delayedJobs);
    }
}
