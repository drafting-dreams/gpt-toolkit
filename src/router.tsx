import { Suspense, lazy } from 'react'
import { createBrowserRouter } from 'react-router-dom'

import type { RouteObject } from 'react-router-dom'

const Home = lazy(() => import('./Home'))
const Amadeus = lazy(() => import('./Amadeus'))

const routes: RouteObject[] = [
  {
    path: '/',
    element: (
      <Suspense>
        <Home />
      </Suspense>
    ),
  },
  {
    path: '/amadeus',
    element: (
      <Suspense>
        <Amadeus />
      </Suspense>
    ),
  },
]

const router = createBrowserRouter(routes)

export default router
