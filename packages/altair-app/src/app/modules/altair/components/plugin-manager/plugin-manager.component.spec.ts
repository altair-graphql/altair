import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { PluginManagerComponent } from './plugin-manager.component';
import { SharedModule } from '../../modules/shared/shared.module';
import { PluginRegistryService } from '../../services';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { of } from 'rxjs';

let mockPluginRegistryService: PluginRegistryService;

describe('PluginManagerComponent', () => {
  let component: PluginManagerComponent;
  let fixture: ComponentFixture<PluginManagerComponent>;

  beforeEach(async () => {
    mockPluginRegistryService = {
      getRemotePluginList: () => of({}),
    } as PluginRegistryService;
    TestBed.configureTestingModule({
      declarations: [PluginManagerComponent],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: false },
      imports: [SharedModule],
      providers: [
        {
          provide: PluginRegistryService,
          useFactory: () => mockPluginRegistryService,
        },
        provideHttpClient(withInterceptorsFromDi()),
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PluginManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
