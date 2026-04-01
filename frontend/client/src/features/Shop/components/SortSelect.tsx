import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getText } from '@/utils/getText';
import { useTranslation } from 'react-i18next';

interface SortSelectProps {
  sorts: any[];
  selectedSortBy: string;
  setSelectedSortBy: (value: string) => void;
  i18n: any;
}

const SortSelect = ({ sorts, selectedSortBy, setSelectedSortBy, i18n }: SortSelectProps) => {
  const { t } = useTranslation();

  return (
    <Select value={selectedSortBy} onValueChange={setSelectedSortBy}>
      <SelectTrigger className="w-40 sm:w-48">
        <SelectValue placeholder={t("Sort by")} />
      </SelectTrigger>
      <SelectContent>
        {sorts.map((sort) => (
          <SelectItem key={sort.key} value={sort.key}>
            {getText(sort.label, i18n.language)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default SortSelect;
