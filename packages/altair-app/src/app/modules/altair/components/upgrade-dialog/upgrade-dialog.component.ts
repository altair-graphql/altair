import { IPlan, IPlanInfo } from '@altairgraphql/api-utils';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output
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
export class UpgradeDialogComponent {
  readonly showDialog = input(true);
  readonly userPlan = input<IPlan>();
  readonly planInfos = input<IPlanInfo[]>([]);
  readonly toggleDialogChange = output<boolean>();

  readonly proPlanInfo = computed<IPlanInfo | undefined>(() => {
    return this.planInfos()?.find((planInfo: IPlanInfo) => planInfo.role === 'pro');
  });

  async openUpgradeProUrl(e: MouseEvent) {
    const { url } = await apiClient.getUpgradeProUrl();
    return externalLink(url, e);
  }
}
