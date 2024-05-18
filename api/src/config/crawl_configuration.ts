import * as fs from 'fs';
import * as path from 'path';
import { CrawlSettings } from './crawl-settings.type';

export default (): CrawlSettings => {
    const configPath = path.resolve(__dirname, '../../crawl_config.json');
    const fileContents = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(fileContents);
};
