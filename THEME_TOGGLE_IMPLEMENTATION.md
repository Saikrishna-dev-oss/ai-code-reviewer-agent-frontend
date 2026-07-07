# Dark and Light Theme Toggle Implementation

## Requirement
Add dark and light themes in frontend as a toggle.

## Files changed

### 1. `src/App.jsx`
Implemented theme state and toggle logic.

Added:
- `theme` state
- `useEffect` to apply the selected theme to the HTML root element
- `localStorage` support so the selected theme stays saved after refresh
- A fixed theme toggle button visible on all screens

Important code:

```jsx
const [theme, setTheme] = useState(() => {
  return localStorage.getItem('app-theme') || 'dark';
});

useEffect(() => {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('app-theme', theme);
}, [theme]);

const toggleTheme = () => {
  setTheme((previousTheme) => previousTheme === 'dark' ? 'light' : 'dark');
};
```

Toggle button:

```jsx
<button
  type="button"
  className="theme-toggle-btn"
  onClick={toggleTheme}
  aria-label="Toggle dark and light theme"
>
  {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
</button>
```

---

### 2. `src/styles/global.css`
Implemented theme variables using CSS custom properties.

Dark theme:

```css
html[data-theme='dark'] {
  --bg-page: #090b14;
  --bg-card: rgba(22, 27, 46, 0.65);
  --bg-dark: #0f1322;
  --text-main: #ffffff;
  --text-muted: #8b9bb4;
}
```

Light theme:

```css
html[data-theme='light'] {
  --bg-page: #f4f7fb;
  --bg-card: rgba(255, 255, 255, 0.92);
  --bg-dark: #eef2f7;
  --text-main: #111827;
  --text-muted: #5f6b7a;
}
```

The existing frontend already uses variables like:

```css
var(--bg-card)
var(--bg-dark)
var(--text-main)
var(--text-muted)
var(--border-color)
var(--primary-accent)
```

So changing these variables automatically changes the theme across login, register, upload, dashboard, review, and profile screens.

## How to test

Run frontend:

```powershell
cd AI-Code-Review-Agent\frontend
npm run dev
```

Open:

```text
http://localhost:5173
```

Click the top-right toggle button:

```text
☀️ Light
🌙 Dark
```

Refresh the page. The selected theme should remain saved.

## Explanation for sir

Dark and light theme support is implemented in the React frontend using state, `useEffect`, `localStorage`, and CSS variables. The selected theme is applied by setting `data-theme` on the root HTML element. Since the existing UI already uses CSS variables, changing the theme variables updates the full frontend without rewriting every page.
