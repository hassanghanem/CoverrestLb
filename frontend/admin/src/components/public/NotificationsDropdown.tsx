import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
    BellIcon,
    ShoppingCartIcon,
    PackageIcon,
    CornerDownLeftIcon,
    MessageCircleIcon,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Notification } from '@/types/api.interfaces';
import { useNotifications } from '@/context/NotificationsContext';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

export function NotificationsDropdown() {
    const {
        notifications,
        totalUnreadCount,
        isLoading,
    } = useNotifications();

    const { t } = useTranslation();
    const navigate = useNavigate();

    function getIcon(type: string) {
        switch (type) {
            case 'order':
                return <ShoppingCartIcon className="h-5 w-5 text-primary" />;
            case 'preorder':
                return <PackageIcon className="h-5 w-5 text-primary" />;
            case 'return_order':
                return <CornerDownLeftIcon className="h-5 w-5 text-primary" />;
            case 'contact':
                return <MessageCircleIcon className="h-5 w-5 text-primary" />;
            case 'review':
                return <MessageCircleIcon className="h-5 w-5 text-yellow-500" />;
            default:
                return <BellIcon className="h-5 w-5 text-primary" />;
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative rounded-full mx-1">
                    <BellIcon className="h-5 w-5" />
                    {totalUnreadCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 rounded-full bg-red-500">
                            {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                className="w-full sm:w-[24rem] max-w-sm p-0 rounded-lg shadow-lg"
                align="end"
                collisionPadding={16}
                forceMount
            >
                <DropdownMenuLabel className="px-4 py-3 border-b">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{t("Notifications")}</h3>
                        {totalUnreadCount > 0 && (
                            <span className="text-xs font-medium text-primary">
                                {t("Unread notifications", { count: totalUnreadCount })}
                            </span>
                        )}
                    </div>
                </DropdownMenuLabel>

                <div className="max-h-[400px] overflow-y-auto">
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center p-6 space-y-2">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
                            <p className="text-sm text-muted-foreground">
                                {t("Loading notifications...")}
                            </p>
                        </div>
                    )}

                    {!isLoading && notifications.length === 0 && (
                        <div className="flex flex-col items-center justify-center p-6 space-y-2">
                            <BellIcon className="h-8 w-8 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                                {t("No notifications")}
                            </p>
                        </div>
                    )}

                    {!isLoading &&
                        notifications.map((notification: Notification) => (
                            <DropdownMenuItem
                                key={`${notification.type}-${notification.created_at}-${notification.order_id ?? notification.contact_id}`}
                                className="focus:bg-accent/50"
                                onClick={() => {
                                    switch (notification.type) {
                                        case 'order':
                                            navigate(`/orders/${notification.order_id}/view`);
                                            break;
                                        case 'preorder':
                                            navigate(`/pre-orders/${notification.order_id}/view`);
                                            break;
                                        case 'return_order':
                                            navigate(`/return-orders/${notification.order_id}/view`);
                                            break;
                                        case 'contact':
                                            navigate(`/contacts`);
                                            break;
                                        case 'review':
                                            navigate(`/reviews`);
                                            break;
                                        default:
                                            break;
                                    }
                                }}
                            >
                                <div className="flex items-start space-x-3 p-3">
                                    <div className="pt-1">{getIcon(notification.type)}</div>
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm font-medium leading-none">
                                            {notification.message}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(notification.created_at).toLocaleString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </DropdownMenuItem>
                        ))}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
