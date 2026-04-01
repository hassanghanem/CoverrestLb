import { RootState } from '@/lib/store/store';
import { useSelector } from 'react-redux';
import BrowserSessions from './BrowserSessions';
import ChangePassword from './ChangePassword';
import ProfileInfo from './ProfileInfo';
import { Main } from '@/components/layout/main';
import { useTranslation } from 'react-i18next';

export default function ProfileViewPage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const { t } = useTranslation();

  return (
    <Main>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          {t('Profile settings')}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-14">
          <div className="lg:col-span-1 space-y-6">
            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                {t('Profile information')}
              </h2>
              <ProfileInfo user={user} />
            </section>
          </div>
          <div className="lg:col-span-2 space-y-6">
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                {t('Security')}
              </h2>
              <div className="space-y-6">
                <ChangePassword />
              </div>
            </section>
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                {t('Active sessions')}
              </h2>
              <BrowserSessions sessions={user?.sessions} />
            </section>
          </div>
        </div>
      </div>
    </Main>
  );
}
