import { Suspense, lazy } from 'react';
import { Main } from '@/components/layout/main';
import Currencies from './currencies';
import Pages from './pages';
import ConfigurationView from './configurations/components/ConfigurationView';
import Spinner from '@/components/public/spinner';

const Brands = lazy(() => import('./brands'));
const Colors = lazy(() => import('./colors'));
const Sizes = lazy(() => import('./sizes'));
const Tags = lazy(() => import('./tags'));
const Warehouses = lazy(() => import('./warehouses'));

const CenteredSpinner = () => (
  <div className="flex items-center justify-center h-40 w-full">
    <Spinner />
  </div>
);

export default function Settings() {
  return (
    <Main>
      <div className="w-full">
        <ConfigurationView />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Suspense fallback={<CenteredSpinner />}><Brands /></Suspense>
        <Suspense fallback={<CenteredSpinner />}><Colors /></Suspense>
        <Suspense fallback={<CenteredSpinner />}><Sizes /></Suspense>
        <Suspense fallback={<CenteredSpinner />}><Tags /></Suspense>
        <Suspense fallback={<CenteredSpinner />}><Currencies /></Suspense>
        <Suspense fallback={<CenteredSpinner />}><Warehouses /></Suspense>
        <Suspense fallback={<CenteredSpinner />}><Pages /></Suspense>
      </div>
    </Main>
  );
}
