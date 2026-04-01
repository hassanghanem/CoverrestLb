import { Dot } from "lucide-react";
import { Session } from "@/types/api.interfaces";
import ConfirmPasswordDialog from "./ConfirmPasswordDialog";
import { useTranslation } from "react-i18next";
import { getDeviceIcon } from "@/components/public/getDeviceIcon";

interface SessionItemProps {
  session: Session;
  onRemove: (password: string, sessionId: string) => void;
}

const SessionItem: React.FC<SessionItemProps> = ({ session, onRemove }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg overflow-hidden break-words">
      <div className="flex items-start space-x-4 w-full sm:w-auto">
        <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg flex-shrink-0">
          {getDeviceIcon(session.device, session.is_mobile, session.is_tablet, session.is_desktop)}
        </div>
        <div className="flex flex-col space-y-1">
          <div className="flex items-center space-x-2">
            <p className="font-medium truncate">
              {session.device} ({session.browser})
            </p>
            {session.is_current_device && <Dot color="green" size={50} />}
          </div>
          <p className="text-sm text-muted-foreground truncate">
            {session.platform} • {session.location} • {session.ip_address}
          </p>
          <p className="text-sm text-muted-foreground truncate">
            <a
              href={`https://www.google.com/maps?q=${session.latitude},${session.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
              title={t("View on Google Maps")}
            >
              {session.latitude.toFixed(4)}, {session.longitude.toFixed(4)}
            </a>
          </p>
          <p className="text-xs text-gray-400">
            {t("Last active")}:{" "}
            {session.last_activity_human === "0 seconds ago"
              ? t("Now")
              : session.last_activity_human}
          </p>
        </div>
      </div>

      {!session.is_current_device && (
        <div className="mt-4 sm:mt-0 sm:ml-4">
          <ConfirmPasswordDialog
            onConfirm={(password) => onRemove(password, session.id)}
            buttonTitle={t("Logout")}
          />
        </div>
      )}
    </div>
  );
};

export default SessionItem;
