import { Injectable } from '@angular/core';
// https://www.bennadel.com/blog/3518-trying-to-create-a-message-bus-using-an-rxjs-subject-in-angular-6-1-10.htm
// Use BehaviorSubject for emitting last value, like on-app-ready

@Injectable({
  providedIn: 'root'
})
export class PluginEventService {

  constructor() { }
}
