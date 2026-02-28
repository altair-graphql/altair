import { NgModule, Component, ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NzConfigService } from 'ng-zorro-antd/core/config';
import { ThemeDirective } from './theme.directive';
import { ICustomTheme } from 'altair-graphql-core/build/theme';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-test-host',
  template:
    '<div [appTheme]="theme" [appDarkTheme]="darkTheme" [appAccentColor]="accentColor" [cspNonce]="nonce"></div>',
  standalone: false,
})
class TestHostComponent {
  theme: ICustomTheme = {};
  darkTheme: ICustomTheme = {};
  accentColor = '';
  nonce = '';
}

@NgModule({
  declarations: [TestHostComponent, ThemeDirective],
  providers: [NzConfigService],
})
class TestModule {}

describe('ThemeDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let directive: ThemeDirective;
  let nzConfigService: NzConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestModule],
    });
    fixture = TestBed.createComponent(TestHostComponent);
    nzConfigService = TestBed.inject(NzConfigService);
    fixture.detectChanges();
    const debugEl = fixture.debugElement.query(By.directive(ThemeDirective));
    directive = debugEl.injector.get(ThemeDirective);
  });

  it('should create an instance', () => {
    expect(directive).toBeTruthy();
  });
});
