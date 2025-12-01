// This script helps fix web compatibility issues
// Run: node scripts/fix-web-compat.js

const fs = require('fs');
const path = require('path');

const files = [
  'app/(tabs)/diagnosis.tsx',
  'app/result.tsx',
  'app/loading.tsx',
  'app/(tabs)/routine.tsx',
  'app/(tabs)/history.tsx',
  'app/routine.tsx',
];

files.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace LinearGradient import
    if (content.includes("import { LinearGradient } from 'expo-linear-gradient';")) {
      content = content.replace(
        "import { LinearGradient } from 'expo-linear-gradient';",
        "import { GradientView } from '@/components/GradientView';"
      );
    }
    
    // Replace LinearGradient usage with GradientView
    content = content.replace(/<LinearGradient/g, '<GradientView');
    content = content.replace(/<\/LinearGradient>/g, '</GradientView>');
    
    // Add Platform import if not present and shadow styles exist
    if (content.includes('shadowColor') && !content.includes("import { StyleSheet") || !content.includes('Platform')) {
      if (content.includes("import { StyleSheet")) {
        content = content.replace(
          /import { StyleSheet([^}]*)} from 'react-native';/,
          (match, p1) => {
            if (!p1.includes('Platform')) {
              return `import { StyleSheet${p1}, Platform} from 'react-native';`;
            }
            return match;
          }
        );
      }
    }
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed: ${file}`);
  }
});

console.log('Done!');

