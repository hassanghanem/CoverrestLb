import { Address } from '@/types/api.interfaces';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Edit, Trash2, MapPin } from 'lucide-react';
import { Badge } from './ui/badge';

interface AddressCardProps {
  address: Address;
  onEdit: (address: Address) => void;
  onDelete?: (address: Address) => void;
}

const AddressCard: React.FC<AddressCardProps> = ({ address, onEdit, onDelete }) => {
  const { t } = useTranslation();

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6">
          {/* Left: Address Data */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 mb-2">
              {address.is_default && (
                <Badge variant="secondary">{t('Default')}</Badge>
              )}
            </div>

            <p><strong>{t('Recipient')}:</strong> {address.recipient_name}</p>
            <p><strong>{t('Address')}:</strong> {address.address}</p>
            <p><strong>{t('City')}:</strong> {address.city}</p>
            <p><strong>{t('Phone')}:</strong> {address.phone_number}</p>
            {address.notes && (
              <p><strong>{t('Notes')}:</strong> {address.notes}</p>
            )}

            {address.latitude && address.longitude && (
              <a
                href={`https://www.google.com/maps?q=${address.latitude},${address.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary hover:underline mt-2"
              >
                <MapPin className="w-4 h-4" />
                {t('View on map')}
              </a>
            )}
          </div>

          {/* Right: Actions */}
          <div className="flex md:flex-col gap-2 justify-start items-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onEdit(address)}
            >
              <Edit className="w-4 h-4" />
            </Button>
            {onDelete && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onDelete(address)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AddressCard;
