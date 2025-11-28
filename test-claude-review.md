# Test Claude Code Review

This is a test file to verify that Claude GitHub Actions are working correctly.

## Features to Test

- ✅ API key configuration
- 🤖 Automatic PR reviews
- 💬 @claude mentions in comments
- 🔄 CI/CD integration

## Test Function

```javascript
// A simple function that could use some review
function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += items[i].price * items[i].quantity;
  }
  return total;
}
```

Claude should review this code and suggest improvements like using array methods, input validation, etc.