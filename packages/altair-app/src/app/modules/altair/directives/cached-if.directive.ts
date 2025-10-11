import {
  Directive,
  effect,
  EmbeddedViewRef,
  input,
  OnDestroy,
  signal,
  TemplateRef,
  ViewContainerRef,
  inject,
} from '@angular/core';

@Directive({
  selector: '[appCachedIf]',
  standalone: false,
})
export class CachedIfDirective implements OnDestroy {
  private templateRef = inject<TemplateRef<unknown>>(TemplateRef);
  private viewContainer = inject(ViewContainerRef);

  private readonly hasView = signal(false);
  private cachedViewRef?: EmbeddedViewRef<unknown>;

  readonly appCachedIf = input(false);

  constructor() {
    effect(() => {
      const val = this.appCachedIf();
      if (val) {
        if (!this.cachedViewRef) {
          // Create the embedded view and cache it
          this.cachedViewRef = this.viewContainer.createEmbeddedView(
            this.templateRef
          );
          this.hasView.set(true);
        } else {
          // Re-attach the cached view if not already attached
          if (!this.hasView()) {
            this.viewContainer.insert(this.cachedViewRef);
          }
          this.hasView.set(true);
        }
      } else {
        if (this.hasView() && this.cachedViewRef) {
          // Detach the view but keep it in memory
          const index = this.viewContainer.indexOf(this.cachedViewRef);
          if (index !== -1) {
            this.viewContainer.detach(index);
            this.hasView.set(false);
          }
        }
      }
    });
  }

  ngOnDestroy(): void {
    if (this.cachedViewRef) {
      this.cachedViewRef.destroy();
      this.cachedViewRef = undefined;
    }
  }
}
