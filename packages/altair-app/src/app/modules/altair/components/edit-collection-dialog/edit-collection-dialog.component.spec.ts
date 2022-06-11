import { EditCollectionDialogComponent } from './edit-collection-dialog.component';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SharedModule } from '../../modules/shared/shared.module';
import { mount, NgxTestWrapper } from '../../../../../testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { expect, it } from '@jest/globals';

describe('EditCollectionDialogComponent', () => {
  let wrapper: NgxTestWrapper<EditCollectionDialogComponent>;

  beforeEach(async() => {
    wrapper = await mount({
      component: EditCollectionDialogComponent,
      declarations: [
        EditCollectionDialogComponent,
      ],
      providers: [],
      imports: [
        BrowserAnimationsModule,
        FormsModule,
        SharedModule,
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    });
  });

  it('should render correctly', () => {
    expect(wrapper.component.nativeElement).toMatchSnapshot();
  });
});
