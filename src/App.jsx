import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import RecipeRecommender from "./components/RecipeRecommender";

function App() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <h1>Foodgasm</h1>
      <RecipeRecommender />
    </div>
  );
}

export default App
