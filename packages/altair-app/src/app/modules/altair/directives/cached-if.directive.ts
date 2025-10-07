import {
  Directive,
  EmbeddedViewRef,
  Input,
  OnDestroy,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';

@Directive({
  selector: '[appCachedIf]',
  standalone: false,
})
export class CachedIfDirective implements OnDestroy {
  private hasView = false;
  private cachedViewRef?: EmbeddedViewRef<unknown>;

  constructor(
    private templateRef: TemplateRef<unknown>,
    private viewContainer: ViewContainerRef
  ) {}

  @Input() set appCachedIf(val: boolean) {
    if (val) {
      if (!this.cachedViewRef) {
        // Create the embedded view and cache it
        this.cachedViewRef = this.viewContainer.createEmbeddedView(this.templateRef);
      } else {
        // Re-attach the cached view if not already attached
        if (!this.hasView) {
          this.viewContainer.insert(this.cachedViewRef);
        }
      }
    } else {
      if (this.hasView && this.cachedViewRef) {
        // Detach the view but keep it in memory
        const index = this.viewContainer.indexOf(this.cachedViewRef);
        if (index !== -1) {
          this.viewContainer.detach(index);
        }
      }
    }
    this.hasView = val;
  }
  ngOnDestroy(): void {
    if (this.cachedViewRef) {
      this.cachedViewRef.destroy();
      this.cachedViewRef = undefined;
    }
  }
}
