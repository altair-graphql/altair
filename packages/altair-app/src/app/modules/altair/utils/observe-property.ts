// https://gist.github.com/dscheerens/9fb7de6b7c47acae98cb9dd6501df6c5

import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Observes the specified property and returns a stream that emits all values which are assigned to the property. When subscribing to the
 * resulting stream it will always first emit the current value of the property, followed by all new values that are assigned to it.
 *
 * @param   target Object containing the property.
 * @param   key    Key of the property that is to be observed.
 * @returns        A stream of all values that are assigned to the specified property, starting with the current value of the property.
 */
export function observeProperty<T, K extends keyof T>(target: T, key: K): Observable<T[K]> {

    interface GetAccessorWithValueStream {
        (): T[K];
        __value$?: Observable<T[K]>;
    }

    const propertyDescriptor = getPropertyDescriptor(target, key);

    const originalGetAccessor: GetAccessorWithValueStream | undefined = propertyDescriptor?.get;

    // If the specified property is already observed return the value stream that was previously created for this property.
    if (originalGetAccessor?.__value$) {
        return originalGetAccessor.__value$;
    }

    const originalSetAccessor = propertyDescriptor?.set;

    const subject = new BehaviorSubject<T[K]>(target[key]);
    const value$ = subject.asObservable();

    const newGetAccessor: GetAccessorWithValueStream = originalGetAccessor
        ? () => originalGetAccessor.call(target)
        : () => subject.getValue();

    newGetAccessor.__value$ = value$;

    Object.defineProperty(target, key, {
        get: newGetAccessor,
        set(newValue: T[K]): void {

            if (originalSetAccessor !== undefined) {
                originalSetAccessor.call(target, newValue);
            }

            const nextValue = originalGetAccessor ? originalGetAccessor.call(target) : newValue;

            if (nextValue !== subject.getValue()) {
                subject.next(nextValue);
            }
        }
    });

    return value$;
}

/**
 * Finds the property descriptor for the property `key` in the specified target. In contrast to `Object.getOwnPropertyDescriptor` this
 * function will descent the prototype hierarchy of the specified target to find the property descriptor, making it suitable for properties
 * that are define through accessor functions on classes.
 *
 * @param target Object that containing the property.
 * @param key    Key of the property whose descriptor is to be retrieved.
 * @returns      The descriptor for the specified property or `undefined` if no such property exists on the target object.
 */
function getPropertyDescriptor(target: any, key: PropertyKey): PropertyDescriptor | undefined {
    if (target === null || target === undefined) {
        return undefined;
    }

    const descriptor = Object.getOwnPropertyDescriptor(target, key);

    return descriptor !== undefined ? descriptor : getPropertyDescriptor(Object.getPrototypeOf(target), key);
}
