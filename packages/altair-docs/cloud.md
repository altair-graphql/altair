---
layout: vp-home
sidebar: false

hero:
  name: Altair GraphQL Cloud
  text: Collaborate. Effectively.
  tagline: Empower your team to share and collaborate together
  image:
    light: /assets/img/synced-collection-1.png
    dark: /assets/img/synced-collection-2.png
    alt: Altair GraphQL Cloud
  actions:
    - theme: brand
      text: Try it for free
      link: /cloud#pricing

features:
  - icon: 🛠️
    title: Centralized Query Management
    details: Bring your team together by centralizing GraphQL queries in one place. Collaborate efficiently, share insights, and boost productivity.
  - icon: 📂
    title: Collections for Effortless Organization
    details: Create collections to categorize and organize your queries logically. No more searching through scattered files—find what you need instantly.
  - icon: 🔄
    title: Query Versioning
    details: Keep a version history of queries for easy rollback and traceability. Never worry about losing crucial information during the development process.
  - icon: 👥
    title: Easy Sharing
    details: Share queries seamlessly with team members using shareable URLs. Accelerate collaboration and eliminate communication gaps.

pricing:
  - title: Basic
    price:
      free: true
    features:
      - Up to 2 team members
      - Up to 20 queries
      - Unlimited collections
      - Query history (up to 10 revisions)
    action:
      link: https://web.altairgraphql.dev/?plan_select=basic&show_login=true
      text: Try it for free
  - title: Pro
    recommended: true
    price:
      amount: 7.99
      currency: $
      frequency: month
    features:
      - Unlimited team members
      - Unlimited teams
      - Unlimited queries
      - Unlimited collections
      - Query history
    action:
      link: https://web.altairgraphql.dev/?plan_select=pro&show_login=true
      text: Try it today
  - title: Enterprise
    price:
      text: Custom
    features:
      - Unlimited team members
      - Unlimited teams
      - Unlimited queries
      - Unlimited collections
      - Query history
      - Full control
    action:
      link: 'mailto:info@altairgraphql.dev'
      text: Contact us
  - title: Self hosted
    price:
      free: true
    features:
      - Unlimited team members
      - Unlimited teams
      - Unlimited queries
      - Unlimited collections
      - Query history
      - Full control
    action:
      link: https://github.com/altair-graphql/altair?tab=readme-ov-file#deployment
      text: Get started
---
