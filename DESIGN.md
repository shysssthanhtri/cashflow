# Design

## Page titles

Every page's `<h1>` uses the Settings page title style:

```tsx
<main className="mx-auto max-w-md p-4">
  <h1 className="px-2 pt-4 pb-4 text-3xl font-bold">Title</h1>
</main>
```

- Pages with a back link (`ChevronLeftIcon` + label) place the `<h1>` below it with `pt-2` instead of `pt-4`; size and weight stay `text-3xl font-bold`.
- A page with a title action (e.g. an "Add" button) wraps the `<h1>` and the action in a `flex items-center justify-between` row with the same padding.
- Matching `loading.tsx` skeletons use `h-9` for the title and the same top margin so the layout doesn't shift.
