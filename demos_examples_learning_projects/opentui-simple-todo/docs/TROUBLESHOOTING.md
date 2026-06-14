# Troubleshooting Guide

## Common Issues and Solutions

### Error: "Text must be created inside of a text node"

**Symptom**: This error appears when creating or updating TODOs, especially after the first TODO is created.

**Root Cause**: OpenTUI requires all text content to be properly structured. Dynamic JSX interpolation inside `<text>` components can cause rendering issues.

**Solution**: Use JavaScript template literals for dynamic text content.

#### ❌ Incorrect (causes error):
```tsx
<text fg="gray">
  ({count} items, {active} active)
</text>
```

#### ✅ Correct:
```tsx
<text fg="gray">
  {`(${count} items, ${active} active)`}
</text>
```

**Or** use separate text elements:
```tsx
<text fg="gray">(</text>
<text fg="gray">{count}</text>
<text fg="gray"> items, </text>
<text fg="gray">{active}</text>
<text fg="gray"> active)</text>
```

---

### TypeScript Compilation Errors

**Issue**: `Property 'flex' does not exist on type...`

**Cause**: OpenTUI doesn't support the CSS `flex` property.

**Solution**: Use `width` or `height` with percentage or fixed values:
```tsx
// ❌ Don't use
<box style={{ flex: 1 }}>

// ✅ Use instead
<box style={{ width: "100%" }}>
// or
<box style={{ width: "70%" }}>
```

---

### App Exits Immediately

**Issue**: App starts but exits right away without showing the UI.

**Possible Causes**:
1. Running in non-interactive terminal (CI/CD environment)
2. Terminal doesn't support TUI features
3. Compilation errors not caught

**Solutions**:
1. Run in an interactive terminal (not via background process)
2. Check terminal compatibility (most modern terminals work)
3. Run `bunx tsc --noEmit` to check for compilation errors

---

### Keyboard Shortcuts Not Working

**Issue**: Pressing keys doesn't trigger expected actions.

**Causes**:
1. Multiple `useKeyboard` hooks conflicting
2. Input is focused when it shouldn't be
3. Terminal capturing keys (Ctrl+C, etc.)

**Solutions**:
1. Ensure only one component handles each key at a time
2. Check `focused` prop on `<input>` components
3. Use alternative keys (e.g., 'q' instead of Ctrl+C for exit)

---

### Text Styling Not Appearing

**Issue**: Colors, bold, italic, etc. not showing.

**Causes**:
1. Terminal doesn't support colors
2. Using wrong prop names
3. Nesting issues

**Solutions**:
1. Check terminal color support: `echo -e "\033[31mRed\033[0m"`
2. Use correct props:
   - `fg` for foreground color (not `color`)
   - Wrap modifiers in `<text>`: `<strong>`, `<em>`, `<u>`
3. Don't nest `<text>` inside `<text>` unnecessarily

---

### Layout Issues

**Issue**: Components overlapping or not displaying correctly.

**Common Mistakes**:
```tsx
// ❌ Missing width/height
<box style={{ padding: 2 }}>

// ✅ Specify dimensions
<box style={{ width: "100%", height: "100%", padding: 2 }}>
```

**Tips**:
- Always set `width` and `height` on container boxes
- Use `flexDirection: "column"` for vertical layouts
- Use `flexDirection: "row"` for horizontal layouts
- Set `justifyContent` and `alignItems` for proper alignment

---

### State Not Updating

**Issue**: TODOs not updating when modified.

**Causes**:
1. Not using state setter functions
2. Mutating state directly
3. Context not properly configured

**Solutions**:
```tsx
// ❌ Don't mutate
todos.push(newTodo);

// ✅ Use setter with new array
setTodos([...todos, newTodo]);

// ❌ Don't mutate
todos[0].completed = true;

// ✅ Use map to create new array
setTodos(todos.map(t => 
  t.id === id ? { ...t, completed: !t.completed } : t
));
```

---

### Focus Management Issues

**Issue**: Input not focused or focus stuck.

**Solution**: Only one component should have `focused={true}` at a time:
```tsx
const [inputFocused, setInputFocused] = useState(true);

<input focused={inputFocused} />
<select focused={!inputFocused} />
```

---

## Debugging Tips

### 1. Check Console Output
OpenTUI captures console logs. Use `console.log()` for debugging:
```tsx
console.log('Current state:', { todos, filter });
```

### 2. TypeScript Checking
Run type checking before testing:
```bash
bunx tsc --noEmit
```

### 3. Component Isolation
Test components individually to identify issues:
```tsx
// Temporarily render only one component
return <WelcomeScreen />;
```

### 4. Simplify Rendering
Remove complex logic to find the issue:
```tsx
// Instead of
{filteredTodos.map(todo => <TodoItem todo={todo} />)}

// Try
{filteredTodos.map(todo => (
  <text key={todo.id}>{todo.text}</text>
))}
```

---

## Getting Help

If you encounter issues not covered here:

1. **Check OpenTUI Examples**: https://github.com/sst/opentui/tree/main/packages/core/src/examples
2. **Review Documentation**: See `docs/OPENTUI_REFERENCE.md`
3. **Check TypeScript Errors**: Run `bunx tsc --noEmit`
4. **Simplify Code**: Reduce to minimal reproduction case
5. **GitHub Issues**: https://github.com/sst/opentui/issues

---

## Quick Fixes Checklist

- [ ] TypeScript compiles without errors
- [ ] All dynamic text uses template literals
- [ ] No `flex` property in styles
- [ ] All boxes have `width` and `height`
- [ ] Only one component has `focused={true}`
- [ ] No direct state mutation
- [ ] Running in interactive terminal
- [ ] Terminal supports colors

---

**Last Updated**: 2024-11-08
