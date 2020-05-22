import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PluginManagerComponent } from './plugin-manager.component';
import { SharedModule } from 'app/modules/shared/shared.module';
import { PluginRegistryService } from 'app/services';
import { HttpClientModule } from '@angular/common/http';
import { of } from 'rxjs';
import { Mock } from 'ts-mocks';

let mockPluginRegistryService: Mock<PluginRegistryService>;

describe('PluginManagerComponent', () => {
  let component: PluginManagerComponent;
  let fixture: ComponentFixture<PluginManagerComponent>;

  beforeEach(async(() => {
    mockPluginRegistryService = new Mock<PluginRegistryService>({
      getRemotePluginList: () => of({})
    });
    TestBed.configureTestingModule({
      providers: [
        {
          provide: PluginRegistryService,
          useFactory: () => mockPluginRegistryService.Object,
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
