import { IPlan, IPlanInfo } from '@altairgraphql/api-utils';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { apiClient } from '../../services/api/api.service';
import { externalLink } from '../../utils';

@Component({
  selector: 'app-upgrade-dialog',
  templateUrl: './upgrade-dialog.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class UpgradeDialogComponent implements OnChanges {
  @Input() showDialog = true;
  @Input() userPlan: IPlan | undefined;
  @Input() planInfos: IPlanInfo[] = [];
  @Output() toggleDialogChange = new EventEmitter<boolean>();

  proPlanInfo: IPlanInfo | undefined;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.planInfos?.currentValue) {
      this.proPlanInfo = changes.planInfos.currentValue.find(
        (planInfo: IPlanInfo) => planInfo.role === 'pro'
      );
    }
  }

  async openUpgradeProUrl(e: MouseEvent) {
    const { url } = await apiClient.getUpgradeProUrl();
    return externalLink(url, e);
  }
}
