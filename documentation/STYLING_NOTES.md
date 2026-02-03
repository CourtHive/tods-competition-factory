# Documentation Styling Notes

## Bulma CSS Integration

The Age Category Code editor and Category editor from `courthive-components` require Bulma CSS and several Bulma extensions for proper styling.

### Added CSS Dependencies

The following CSS libraries have been imported via CDN in `src/css/custom.css`:

1. **Bulma** (v0.9.4) - Core CSS framework
2. **Bulma Checkradio** (v1.1.1) - Checkbox and radio button styling
3. **Bulma Switch** (v2.0.4) - Switch/toggle styling
4. **VanillaJS Datepicker** (v1.3.4) - Date picker styling (Bulma theme)
5. **Awesomplete** (v1.1.7) - Autocomplete/type-ahead styling

### Scoping Strategy

To prevent conflicts between Bulma and Docusaurus's Infima CSS framework, additional scoped styles were added:

- Modal-specific button styling
- Form element styling scoped to `.modal` context
- Backdrop and container styles
- Color overrides to match Docusaurus theme

### Why .mdx Extension is Required

The age-category.mdx and events-categories.mdx files use the `.mdx` extension because they:

1. Import and use React components (`BrowserOnly`, `AgeCategoryEditor`, `CategoryEditorDemo`)
2. Use JSX syntax directly in the markdown
3. Need to be processed by Docusaurus's MDX loader

Changing to `.md` would break the component rendering.

## React Warnings (Expected)

The browser console shows React warnings that are **expected and not related to our changes**:

### 1. ReactDOM.render Warning

```
Warning: ReactDOM.render is no longer supported in React 18.
```

**Cause**: Docusaurus 2.4.3 uses React 18 but hasn't fully migrated to the new `createRoot` API.

**Impact**: None on functionality. This is a deprecation warning from Docusaurus's internal code.

**Resolution**: Will be fixed when Docusaurus upgrades their React integration.

### 2. Legacy contextTypes Warning

```
Warning: LoadableComponent uses the legacy contextTypes API
```

**Cause**: Docusaurus's `@docusaurus/react-loadable` package uses the legacy Context API.

**Impact**: None on functionality. This is a deprecation warning.

**Resolution**: Will be fixed in future Docusaurus updates.

## Testing the Changes

To test the styling locally:

```bash
cd factory/documentation
npm start
```

Then navigate to:

- Age Category Codes: http://localhost:3000/competition-factory/docs/codes/age-category
- Events and Categories: http://localhost:3000/competition-factory/docs/concepts/events-categories

Click the editor buttons to verify:

- Modal dialogs appear correctly
- Form elements are styled properly
- Buttons have correct colors and spacing
- Inputs and selects are visible and functional
