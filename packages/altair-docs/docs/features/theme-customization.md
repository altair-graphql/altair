---
parent: Features
---

# Theme Customization

Altair comes with a `light`, `dark` and `dracula` theme. It also allows you specify `system` which would automatically pick either `light` or `dark` theme based on your system color scheme preference. Customize this by specifying `theme` in your [settings](/docs/features/settings-pane). You can also optionally specify `theme.dark` if you want a different theme that will be used if your system color scheme is set to dark mode.

You can also customize the theme and tweak the color scheme of Altair based on your preferences or to match with the look and feel of your product. To customize this, specify `themeConfig` in your [settings](/docs/features/settings-pane). The interface for the theme config can be found [here](/api/core/theme/theme/type-aliases/ITheme).

Here's an example theme config of a faded blue-green theme in Altair, with transparent comments (but why?!) in the editor:

```json
{
  // ...
  "themeConfig": {
    "colors": {
      "primary": "#629460",
      "secondary": "#385F71",
      "font": "#F5F0F6",
      "bg": "#2B4162",
      "offBg": "#3A5070",
      "headerBg": "#2B4162"
    },
    "editor": {
      "colors": {
        "comment": "transparent"
      }
    }
  }
}
```

![Pale blue-green Altair theme](/assets/img/docs/pale-blue-green-theme.png)

That was nice and easy! And it gets better.. you can publish your theme as [a plugin](/docs/plugins/writing-plugin) so others can also enjoy it!

::: tip Note
You can also customize the accent color of Altair by specifying `accentColor` in your [environment variables](/docs/features/environment-variables#special-environment-variables). This is useful if you wish to switch the accent color based on the environment you are working with.
:::
