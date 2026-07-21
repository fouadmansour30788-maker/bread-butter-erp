// Stock placeholder imagery (free Unsplash License, verified non-Unsplash+).
// Swap these for real Bread & Butter photography whenever it's available —
// this is the only file that needs to change.
function unsplash(id: string, w = 2000) {
  return `https://images.unsplash.com/${id}?fm=jpg&q=80&w=${w}&auto=format&fit=crop`
}

export const marketingImages = {
  hero: unsplash('photo-1726726192151-6d4139ff229d', 2400), // lunch box, back-to-school
  about: unsplash('photo-1635169705517-a60f2cb18445'),      // boy holding a loaf of bread
  healthImpact: unsplash('photo-1774758935123-7d3bb69df565'), // boy eating a bowl of food
  menuPastries: unsplash('photo-1720091382934-fc9fdff94857'), // bakery pastry display case
  menuSandwich: unsplash('photo-1753798130695-3c060be80e83'), // fresh sandwich
  catering: unsplash('photo-1517638851339-a711cfcf3279'),     // server holding a tray
} as const
