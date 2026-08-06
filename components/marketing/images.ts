// Stock placeholder imagery (free Unsplash License, verified non-Unsplash+).
// Swap these for real Bread & Butter photography whenever it's available —
// this is the only file that needs to change.
function unsplash(id: string, w = 2000) {
  return `https://images.unsplash.com/${id}?fm=jpg&q=80&w=${w}&auto=format&fit=crop`
}

export const marketingImages = {
  healthImpact: unsplash('photo-1629646546565-47267ed247b4'), // school-age boy eating watermelon
  catering: unsplash('photo-1696940823960-ee5242bddc47'),     // hotel-style buffet spread, no alcohol
  socialBakery: '/images/social-bakery-display.jpg',          // real kiosk display case, from brand footage
} as const
