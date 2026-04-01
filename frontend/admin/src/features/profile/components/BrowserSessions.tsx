import { Card, CardContent } from "@/components/ui/card";
import { FC } from "react";
import { Session } from "@/types/api.interfaces";
import SessionItem from "./SessionItem";
import { toast } from "sonner";
import ConfirmPasswordDialog from "./ConfirmPasswordDialog";
import { destroySession, logoutOtherSessions } from "@/lib/services/Sessions-services";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

interface BrowserSessionsProps {
    sessions?: Session[] | null;
}

const BrowserSessions: FC<BrowserSessionsProps> = ({ sessions = [] }) => {
    const queryClient = useQueryClient();
    const { t } = useTranslation();

    const handleLogoutOtherSessions = async (password: string) => {
        const response = await logoutOtherSessions(password);
        if (response.result) {
            await queryClient.invalidateQueries({ queryKey: ["user"] });
        } else {
            toast.error(response.message);
        }
    };

    const handleLogoutSession = async (password: string, sessionId: string) => {
        const response = await destroySession(password, sessionId);
        if (response.result) {
            await queryClient.invalidateQueries({ queryKey: ["user"] });
        } else {
            toast.error(response.message);
        }
    };

    return (
        <Card className="overflow-hidden">
            <CardContent className="space-y-6 p-6">
                <div className="space-y-4">
                    <h3 className="font-medium break-words">
                        {t("Active sessions")}
                    </h3>
                    <p className="text-sm text-muted-foreground break-words">
                        {t("These are devices that have logged into your account.")}
                    </p>
                </div>

                <div className="overflow-x-auto">
                    <div className="space-y-2 min-w-[600px]">
                        {sessions?.map((session) => (
                            <SessionItem key={session.id} session={session} onRemove={handleLogoutSession} />
                        ))}
                    </div>
                </div>

                <ConfirmPasswordDialog
                    onConfirm={handleLogoutOtherSessions}
                    buttonTitle={t("Logout other sessions")}
                />
            </CardContent>
        </Card>
    );
};

export default BrowserSessions;
