import { trigger, transition, style, animate } from '@angular/animations';

export const fadeInOutAnimationTrigger = trigger(
  'fadeInOutAnimation',
  [
    transition(
      ':enter',
      [
        style({ opacity: 0 }),
        animate('.3s ease', style({ opacity: 1 }))
      ]
    ),
    transition(
      ':leave',
      [
        style({ opacity: 1 }),
        animate('.3s ease', style({ opacity: 0 }))
      ]
    )
  ]
);
