// Simple script to run in browser console to test annotation system

// Mock login status
localStorage.setItem('isLoggedIn', 'true');
console.log('✅ User logged in status set');

// Instructions
console.log(`
📝 Testing Instructions:
1. Navigate to http://localhost:3000/genesis/1 or http://localhost:3000/john/3
2. Click on any verse to see the annotation sidebar
3. Verses with annotations will be highlighted in blue
4. Select text in a verse to see "Drop wisdom" button
5. Click "Add your wisdom" to open the editor
6. Test the rich text formatting (bold, italic, links)
7. Submit an annotation and see it appear in the sidebar

Mock annotations are already available on:
- Genesis 1:1-3 
- John 3:16-17
`);