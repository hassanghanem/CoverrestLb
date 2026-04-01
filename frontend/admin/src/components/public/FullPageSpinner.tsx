import { useFullPageLoading } from '@/context/FullPageLoadingContext';
import StaticFullPageSpinner from './StaticFullPageSpinner';

export default function FullPageSpinner() {
  const { FullPageloading } = useFullPageLoading();

  return (
    FullPageloading && (
     <StaticFullPageSpinner/>
    )
  );
}

