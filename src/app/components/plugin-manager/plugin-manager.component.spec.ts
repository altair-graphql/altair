import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PluginManagerComponent } from './plugin-manager.component';
import { SharedModule } from 'app/modules/shared/shared.module';
import { PluginRegistryService } from 'app/services';
import { HttpClientModule } from '@angular/common/http';
import { PluginPropsFactory } from 'app/services/plugin/plugin-props-factory';

describe('PluginManagerComponent', () => {
  let component: PluginManagerComponent;
  let fixture: ComponentFixture<PluginManagerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [
        PluginRegistryService,
        {
          provide: PluginPropsFactory,
          use: {
            getPluginProps() {},
          }
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
