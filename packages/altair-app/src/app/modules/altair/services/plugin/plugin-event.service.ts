// Based on: https://github.com/bennadel/JavaScript-Demos/blob/master/demos/message-bus-actions-angular6/app/message-bus.ts
import { Injectable, ErrorHandler } from '@angular/core';
import { PluginEvent, PluginEventCallback, PluginEventPayloadMap } from 'altair-graphql-core/build/plugin/event/event.interfaces';
import { Subject, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

interface PluginEventData {
  event: PluginEvent;
  payload: any;
}

@Injectable({
  providedIn: 'root'
})
export class PluginEventService {
  private eventStream = new Subject<PluginEventData>();

  constructor(
    private errorHandler: ErrorHandler,
  ) {}

  /**
   * Creates a group for managing multiple subscriptions within single contexts
   */
  group() {
    return new PluginEventGroup(this);
  }

  /**
   * Pushes an event data to the stream
   */
  emit<E extends PluginEvent>(event: E, payload: PluginEventPayloadMap[E]) {
    return this.eventStream.next({
      event,
      payload,
    });
  }

  /**
   * Subscribe to specific event
   */
  on<E extends PluginEvent>(event: E, callback: PluginEventCallback<E>) {
    return this.eventStream.pipe(
      filter(_ => _.event === event),
    ).subscribe(evtData => {
      try {
        callback(evtData.payload);
      } catch (error) {
        this.errorHandler.handleError(error);
      }
    });
  }
}

class PluginEventGroup {
  private subscriptions: Subscription[] = [];

  constructor(
    private pluginEventService: PluginEventService,
  ) {}

  emit<E extends PluginEvent>(event: E, payload: PluginEventPayloadMap[E]) {
    return this.pluginEventService.emit(event, payload);
  }

  on<E extends PluginEvent>(event: E, callback: PluginEventCallback<E>) {
    const subscription = this.pluginEventService.on(event, callback);
    this.subscriptions.push(subscription);

    return {
      unsubscribe: () => {
        this.subscriptions = this.subscriptions.filter(_ => _ !== subscription);
        if (!subscription.closed) {
          return subscription.unsubscribe();
        }
      },
    };
  }

  unsubscribe() {
    for (const subscription of this.subscriptions) {
      subscription.unsubscribe();
    }

    this.subscriptions = [];
  }
}
