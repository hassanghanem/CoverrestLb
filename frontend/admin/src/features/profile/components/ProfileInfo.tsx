import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FC } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@/types/api.interfaces";
import { useTranslation } from "react-i18next";

interface ProfileInfoProps {
  user?: User | null;
}

const ProfileInfo: FC<ProfileInfoProps> = ({ user }) => {
  const { t: messages } = useTranslation();

  return (
    <Card className="w-full max-w-2xl mx-auto overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-lg break-words">
          {messages("Profile Details")}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <Avatar className="h-24 w-24">
            <AvatarImage src={user?.image} alt={user?.name || "User"} />
            <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
        </div>

        <div className="space-y-6">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              {messages("Full Name")}
            </p>
            <p className="font-semibold break-words max-w-full">{user?.name}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              {messages("Email")}
            </p>
            <p className="font-semibold break-words max-w-full">{user?.email}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileInfo;
