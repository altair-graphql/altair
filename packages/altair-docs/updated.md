---
title: Updated
sidebar: false
outline: false
layout: plain
---

<script setup>
import { useData } from 'vitepress'

const { theme, page, frontmatter } = useData()
import { data } from './.vitepress/plugins/github-metadata.data'
</script>

# Altair has been updated! - {{ data?.latest_release?.tag_name }}

<Markdown :markdown="data.latest_release.body" />
