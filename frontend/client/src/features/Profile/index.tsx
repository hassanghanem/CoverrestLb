import {
  Package,
  MapPin,
  Settings,
  ShoppingCart,
  Ticket
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import LogoutButton from '@/components/LogoutButton';
import { RootState } from '@/lib/store/store';
import { useSelector } from 'react-redux';
import SettingsTab from './components/SettingsTab';
import AddressesTab from './components/AddressesTab';
import OrdersTab from './components/OrdersTab';
import PreOrdersTab from './components/PreOrdersTab';
import CouponsTab from './components/CouponsTab';
import { useTranslation } from 'react-i18next';

function getInitials(name?: string) {
  if (!name) return "NA";

  const words = name.trim().split(" ").filter(Boolean);

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  } else {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
}

const Profile = () => {
  const { t } = useTranslation();
  const client = useSelector((state: RootState) => state.auth.client);

  return (
    <>
      <div className="container mx-auto container-padding py-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
          <div className="flex items-center space-x-6">
            <Avatar className="w-20 h-20">
              <AvatarFallback className="text-2xl font-bold">
                {getInitials(client?.name)}
              </AvatarFallback>
            </Avatar>

            <div>
              <h1 className="text-3xl font-bold">{client?.name}</h1>
              <p className="text-muted-foreground mt-1">
                {t("Member since")}{" "}
                {client?.created_at
                  ? new Date(client.created_at).toLocaleString("en-US", { month: "long", year: "numeric" })
                  : t("Unknown")}
              </p>
            </div>
          </div>
          <LogoutButton />
        </div>


        <Tabs defaultValue="orders" className="space-y-15">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 gap-2 bg-muted">
            <TabsTrigger value="orders" className="gap-2">
              <ShoppingCart className="w-4 h-4" />
              {t("Orders")}
            </TabsTrigger>

            <TabsTrigger value="pre_orders" className="gap-2">
              <Package className="w-4 h-4" />
              {t("Pre-orders")}
            </TabsTrigger>

            <TabsTrigger value="coupons" className="gap-2">
              <Ticket className="w-4 h-4" />
              {t("Coupons")}
            </TabsTrigger>

            <TabsTrigger value="addresses" className="gap-2">
              <MapPin className="w-4 h-4" />
              {t("Addresses")}
            </TabsTrigger>

            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              {t("Settings")}
            </TabsTrigger>
          </TabsList>


          <OrdersTab />
          <PreOrdersTab />
          <CouponsTab />
          <AddressesTab />
          <SettingsTab />
        </Tabs>
      </div>
    </>
  );
};

export default Profile;
