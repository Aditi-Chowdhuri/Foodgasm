import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import RecipeRecommender from "./components/RecipeRecommender";

function App() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <h1>Welcome to the Recipe App</h1>
      <RecipeRecommender />
    </div>
  );
}

export default App
