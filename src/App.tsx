import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { IngredientsList } from './pages/Ingredients';
import { AddIngredient } from './pages/Ingredients';
import { EditIngredient } from './pages/Ingredients';
import { RecipesList } from './pages/Recipes';
import { AddRecipe } from './pages/Recipes';
import { RecipeDetail } from './pages/Recipes';
import { EditRecipe } from './pages/Recipes';
import { Recommend } from './pages/Recommend';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/ingredients" element={<IngredientsList />} />
        <Route path="/ingredients/add" element={<AddIngredient />} />
        <Route path="/ingredients/:id" element={<EditIngredient />} />
        <Route path="/recipes" element={<RecipesList />} />
        <Route path="/recipes/add" element={<AddRecipe />} />
        <Route path="/recipes/:id" element={<RecipeDetail />} />
        <Route path="/recipes/:id/edit" element={<EditRecipe />} />
        <Route path="/recommend" element={<Recommend />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
