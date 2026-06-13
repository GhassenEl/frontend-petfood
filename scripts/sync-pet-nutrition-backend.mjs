import fs from 'fs';
import path from 'path';

const root = process.cwd();
const src = fs.readFileSync(path.join(root, 'src/utils/petNutritionRecommender.js'), 'utf8');
let out = src
  .replace(
    /import \{[\s\S]*?\} from '\.\/petCalorieCalculator';/,
    `const { calculatePetCalories, petAgeYears } = require('./petCalorieCalculator');

const PET_TYPE_LABELS = {
  dog: 'Chien', cat: 'Chat', bird: 'Oiseau', fish: 'Poisson', rabbit: 'Lapin / NAC', other: 'Autre',
};`,
  )
  .replace(/^export const /gm, 'const ')
  .replace(/^export /gm, '');

out += `
module.exports = {
  resolveBreedProfile,
  getWeightStatus,
  buildPetNutritionRecommendation,
  matchProductsForPet,
  buildAllPetNutritionRecommendations,
};
`;

const dest = path.join(root, 'backend/utils/petNutritionRecommender.js');
fs.writeFileSync(dest, out);
console.log('OK ->', dest);
