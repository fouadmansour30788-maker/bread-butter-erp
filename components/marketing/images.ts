// Stock placeholder imagery (free Unsplash License, verified non-Unsplash+).
// Swap these for real Bread & Butter photography whenever it's available —
// this is the only file that needs to change.
function unsplash(id: string, w = 2000) {
  return `https://images.unsplash.com/${id}?fm=jpg&q=80&w=${w}&auto=format&fit=crop`
}

export const marketingImages = {
  hero: unsplash('photo-1543352632-5a4b24e4d2a6', 2400), // healthy meal-prep boxes: rice, veg, lentils
  about: unsplash('photo-1635169705517-a60f2cb18445'),      // boy holding a loaf of bread
  healthImpact: unsplash('photo-1629646546565-47267ed247b4'), // school-age boy eating watermelon
  menuPastries: unsplash('photo-1720091382934-fc9fdff94857'), // bakery pastry display case
  menuSandwich: unsplash('photo-1753798130695-3c060be80e83'), // fresh sandwich
  catering: unsplash('photo-1696940823960-ee5242bddc47'),     // hotel-style buffet spread, no alcohol
} as const
