import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PluginManagerComponent } from './plugin-manager.component';
import { SharedModule } from 'app/modules/shared/shared.module';
import { PluginRegistryService } from 'app/services';
import { HttpClientModule } from '@angular/common/http';
import { of } from 'rxjs';

let mockPluginRegistryService: PluginRegistryService;

describe('PluginManagerComponent', () => {
  let component: PluginManagerComponent;
  let fixture: ComponentFixture<PluginManagerComponent>;

  beforeEach(async(() => {
    mockPluginRegistryService = {
      getRemotePluginList: () => of({})
    } as PluginRegistryService;
    TestBed.configureTestingModule({
      providers: [
        {
          provide: PluginRegistryService,
          useFactory: () => mockPluginRegistryService,
        }
      ],
      imports: [
        HttpClientModule,
        SharedModule,
      ],
      declarations: [ PluginManagerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PluginManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
