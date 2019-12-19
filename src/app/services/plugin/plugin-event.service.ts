import { Injectable, ErrorHandler } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';
import { IDictionary } from 'app/interfaces/shared';

export type PluginEvent =
  | 'app-ready'
  | 'new-window'
  ;

@Injectable({
  providedIn: 'root'
})
export class PluginEventService {

  private subjects: IDictionary<Subject<any>> = {};

  emit(eventName: PluginEvent, data: any) {
    this.getSubject(eventName).next(data);
  }

  on(eventName: PluginEvent, handler: (value: any) => void) {
    return this.getSubject(eventName).subscribe((data) => {
      if (data !== null) {
        return handler(data);
      }
    });
  }

  unsubscribe() {
    Object.values(this.subjects).forEach(subject => subject.unsubscribe());
  }

  private getSubject(eventName: string) {
    const subjectName = this.createSubjectName(eventName);

    if (!this.subjects[subjectName]) {
      if (subjectName.endsWith('-ready')) {
        this.subjects[subjectName] = new BehaviorSubject(null);
      } else {
        this.subjects[subjectName] = new Subject();
      }
    }
    return this.subjects[subjectName];
  }

  private createSubjectName(eventName: string) {
    return `$ ${eventName}`;
  }
}
