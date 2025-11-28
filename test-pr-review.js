// Test file for Claude automatic PR review
// Updated to test AWS Bedrock configuration - no more credit requirements!
function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += items[i].price * items[i].quantity;
  }
  return total;
}

function processUserData(users) {
  var results = [];
  for (var j = 0; j < users.length; j++) {
    if (users[j].age > 18) {
      results.push({
        name: users[j].name,
        email: users[j].email,
        isAdult: true
      });
    }
  }
  return results;
}

// TODO: Add input validation
// TODO: Handle edge cases
function divideNumbers(a, b) {
  return a / b;
}

export { calculateTotal, processUserData, divideNumbers };