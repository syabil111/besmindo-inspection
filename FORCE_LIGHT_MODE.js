// ============================================================================
// EMERGENCY FIX: Force Light Mode
// Paste this in browser console (F12) to force light mode
// ============================================================================

console.log('🔧 EMERGENCY FIX: Forcing Light Mode...');

// Step 1: Remove dark class from HTML
document.documentElement.classList.remove('dark');
console.log('✅ Removed dark class from HTML');

// Step 2: Clear localStorage
localStorage.removeItem('besmindo-theme');
console.log('✅ Cleared theme from localStorage');

// Step 3: Set to light mode
localStorage.setItem('besmindo-theme', 'light');
console.log('✅ Set light mode in localStorage');

// Step 4: Verify
console.log('🔍 Current HTML classes:', document.documentElement.classList.toString());
console.log('🔍 localStorage theme:', localStorage.getItem('besmindo-theme'));

// Step 5: Reload page
console.log('🔄 Reloading page in 2 seconds...');
setTimeout(() => {
  location.reload();
}, 2000);

console.log('✅ DONE! Light mode will be active after reload.');
