import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NzConfigService } from 'ng-zorro-antd/core/config';
import { ThemeDirective } from './theme.directive';
import { ICustomTheme } from 'altair-graphql-core/build/theme';
import { DirectivesModule } from '../index';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-test-host',
  template:
    '<div [appTheme]="theme" [appDarkTheme]="darkTheme" [appAccentColor]="accentColor" [cspNonce]="nonce"></div>',
  standalone: true,
  imports: [DirectivesModule],
})
class TestHostComponent {
  theme: ICustomTheme = {};
  darkTheme: ICustomTheme = {};
  accentColor = '';
  nonce = '';
}

describe('ThemeDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let directive: ThemeDirective;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [NzConfigService],
    });
    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    const debugEl = fixture.debugElement.query(By.directive(ThemeDirective));
    directive = debugEl.injector.get(ThemeDirective);
  });

  it('should create an instance', () => {
    expect(directive).toBeTruthy();
  });
});
