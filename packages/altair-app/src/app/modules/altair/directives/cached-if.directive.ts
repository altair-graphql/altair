import {
  Directive,
  effect,
  EmbeddedViewRef,
  input,
  OnDestroy,
  signal,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';

@Directive({
  selector: '[appCachedIf]',
  standalone: false,
})
export class CachedIfDirective implements OnDestroy {
  private readonly hasView = signal(false);
  private cachedViewRef?: EmbeddedViewRef<unknown>;

  readonly appCachedIf = input(false);

  constructor(
    private templateRef: TemplateRef<unknown>,
    private viewContainer: ViewContainerRef
  ) {
    effect(() => {
      const val = this.appCachedIf();
      if (val) {
        if (!this.cachedViewRef) {
          // Create the embedded view and cache it
          this.cachedViewRef = this.viewContainer.createEmbeddedView(
            this.templateRef
          );
        } else {
          // Re-attach the cached view if not already attached
          if (!this.hasView()) {
            this.viewContainer.insert(this.cachedViewRef);
          }
        }
      } else {
        if (this.hasView() && this.cachedViewRef) {
          // Detach the view but keep it in memory
          const index = this.viewContainer.indexOf(this.cachedViewRef);
          if (index !== -1) {
            this.viewContainer.detach(index);
          }
        }
      }
      this.hasView.set(val);
    });
  }

  ngOnDestroy(): void {
    if (this.cachedViewRef) {
      this.cachedViewRef.destroy();
      this.cachedViewRef = undefined;
    }
  }
}
