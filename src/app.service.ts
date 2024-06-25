import { Injectable } from '@nestjs/common';
import { previewPage } from './common/html/previewPage';

@Injectable()
export class AppService {
  defaultPage() {
    return previewPage;
  }
}
